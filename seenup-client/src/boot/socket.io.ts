// src/boot/socket.io.ts

import { boot } from 'quasar/wrappers';
import { Manager } from 'socket.io-client';
import { SocketManager } from 'src/services/SocketManager';

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $io: Manager;
    }
}

const io = SocketManager.createManager(process.env.API_URL);

export default boot(({ app }) => {
    app.config.globalProperties.$io = io;
});

export { io };
