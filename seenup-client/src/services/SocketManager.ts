// src/services/SocketManager.ts

import { Manager, Socket } from 'socket.io-client';
import { authManager } from '.';
import { useChannelsStore } from 'src/stores/module-channels/useChannelsStore';

export interface SocketManagerContract {
    namespace: string;
    readonly socket: Socket;
    subscribe(): void;
    destroy(): void;
}

interface ConnectErrorData {
    status?: number;
    // Include other properties if necessary
    [key: string]: unknown;
}

export interface SocketManagerConstructorContract {
    new(namespace: string): SocketManagerContract;
    getManager(): Manager;
    createManager(uri: string): Manager;
    addInstance(instance: SocketManagerContract): void;
    destroyInstance(instance: SocketManagerContract): void;
}

const DEBUG = process.env.NODE_ENV === 'development';

export abstract class SocketManager implements SocketManagerContract {
    private static manager: Manager;
    private static namespaces: Set<string> = new Set();

    public static getManager() {
        if (!this.manager) {
            throw new Error(
                'Socket.io Manager not created. Please call "SocketManager.createManager(uri)" in the Quasar boot file.'
            );
        }
        return this.manager;
    }

    public static createManager(uri?: string): Manager {
        console.log('createManager called with uri:', uri);
        this.manager = new Manager(uri, { autoConnect: false });
        return this.manager;
    }

    public static addInstance(instance: SocketManagerContract): void {
        if (this.namespaces.has(instance.namespace)) {
            throw new Error(
                `Duplicate socket manager created for namespace "${instance.namespace}".`
            );
        }
        this.namespaces.add(instance.namespace);
        this.bootInstance(instance);
    }

    public static destroyInstance(instance: SocketManagerContract & { $socket: Socket | null }): void {
        this.namespaces.delete(instance.namespace);
        // Disconnect and clean socket
        instance.socket.disconnect();
        instance.socket.removeAllListeners();
        instance.$socket = null;
    }

    private static bootInstance(instance: SocketManagerContract): void {
        instance.subscribe();
        // Connect socket - if it was not used in subscribe, it will be created
        instance.socket.connect();

        instance.socket.on('join_channel', (data: { channelId: number, channelName: string, isPrivate: boolean, userId: string }) => {
            useChannelsStore().join(data.channelName, data.isPrivate);
            console.log('Received join_channel event with:', data)
        });

        instance.socket.on('invited_to_channel', (data: { channelId: number, channelName: string, isPrivate: boolean, userId: string }) => {
            
            console.log('Received invited_to_channel event with:', data)
        });


        instance.socket.on('channel:deleted', (data: { channelId: string }) => {
            console.log('Received channel:deleted event:', data)
        });
    }

    private $socket: Socket | null = null;

    public get socket(): Socket {
        if (!this.$socket) {
            this.$socket = this.socketWithAuth();
        }
        return this.$socket;
    }

    constructor(public namespace: string) {
        console.log(`SocketManager constructor for namespace: ${namespace}`);
        (this.constructor as SocketManagerConstructorContract).addInstance(this);
    }

    private socketWithAuth(): Socket {
        console.log(`socketWithAuth called for namespace: ${this.namespace}`);
        const io = (this.constructor as SocketManagerConstructorContract).getManager();

        const socket = io.socket(this.namespace, {
            auth: { token: authManager.getToken() },
        });

        socket.on('connect_error', (err: Error & { data?: ConnectErrorData }) => {
            if (DEBUG) {
                console.error(`${this.namespace} [connect_error]`, err.message, err.data);
            }

            if (err.data?.status === 401) {
                const unsubscribe = authManager.onChange((token) => {
                    socket.auth = { token };
                    unsubscribe();
                    socket.connect();
                });
            }
        });

        console.log('process.env.NODE_ENV:', process.env.NODE_ENV);

        if (DEBUG) {
            socket.on('connect', () => {
                console.info(`${this.namespace} [connect]`);
            });

            socket.on('disconnect', (reason) => {
                console.info(`${this.namespace} [disconnect]`, reason);
            });

            socket.on('error', (err: Error) => {
                console.error(`${this.namespace} [error]`, err.message);
            });

            socket.onAny((event, ...args) => {
                console.info(`${this.namespace} [${event}]`, args);
            });
        }

        return socket;
    }

    protected emitAsync<T>(event: string, ...args: unknown[]): Promise<T> {
        return new Promise((resolve, reject) => {
            this.socket.emit(event, ...args, (error: Error | null, response: T) => {
                error ? reject(error) : resolve(response);
            });
        });
    }

    public destroy(): void {
        (this.constructor as SocketManagerConstructorContract).destroyInstance(this);
    }

    public abstract subscribe(): void;
}
