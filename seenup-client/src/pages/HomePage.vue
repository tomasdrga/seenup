<template>
  <!-- Main container for the Home page -->
  <q-page class="q-pa-md text-primary q-pt-xl q-px-xl">
    <!-- Parallax Section -->
    <div>
      <div class="q-pa-md column justify-center">
        <h1 class="text-h3 text-weight-bold text-center">Welcome to SeenUp</h1>
        <p class="text-h6 text-center">The most fun you can have at work without a clown suit!</p>
        <div class="row justify-center">
          <q-btn color="primary" label="Get Started" to="/login" class="q-mt-md" />
        </div>
      </div>
    </div>

    <!-- Statistics Section -->
    <div class="q-mt-xl">
      <q-card flat class="bg-grey">
        <q-card-section>
          <h2 class="text-h5 text-center text-weight-bold">Why SeenUp?</h2>
          <p class="text-center">Here are some hilarious statistics that might just convince you:</p>
        </q-card-section>
      </q-card>

      <div class="row q-gutter-md q-mt-xs justify-center">
        <!-- Statistic Card 1 -->
        <div class="col-12 col-md-3">
          <q-card flat bordered class="bg-grey">
            <q-card-section>
              <h3 class="text-h5 text-center text-weight-bold">100% Fun</h3>
              <p class="text-center">Our team guarantees that every message brings at least a smile!</p>
            </q-card-section>
          </q-card>
        </div>

        <!-- Statistic Card 2 -->
        <div class="col-12 col-md-3">
          <q-card flat bordered class="bg-grey">
            <q-card-section>
              <h3 class="text-h5 text-center text-weight-bold">80% Less Boring</h3>
              <p class="text-center">Say goodbye to snooze-fest meetings! We keep it fun and engaging!</p>
            </q-card-section>
          </q-card>
        </div>

        <!-- Statistic Card 3 -->
        <div class="col-12 col-md-3">
          <q-card flat bordered class="bg-grey">
            <q-card-section>
              <h3 class="text-h5 text-center text-weight-bold">99% Collab</h3>
              <p class="text-center">Our platform makes teamwork easier and more enjoyable!</p>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="q-gutter-md q-my-xl">
      <q-card flat class="bg-grey">
        <q-card-section>
          <h2 class="text-h5 text-center text-weight-bold">What We Offer</h2>
          <p class="text-center">From memes to meetings, we have it all!</p>
        </q-card-section>
      </q-card>

      <div class="row q-gutter-md q-mt-xs justify-center">
        <!-- Feature Card 1 -->
        <div class="col-12 col-md-3">
          <q-card flat bordered class="bg-grey">
            <q-card-section>
              <h3 class="text-h5 text-center text-weight-bold">Instant Messaging</h3>
              <p class="text-center">Chat with your colleagues faster than you can say “I need coffee!”</p>
            </q-card-section>
          </q-card>
        </div>

        <!-- Feature Card 2 -->
        <div class="col-12 col-md-3">
          <q-card flat bordered class="bg-grey">
            <q-card-section>
              <h3 class="text-h5 text-center text-weight-bold">File Sharing</h3>
              <p class="text-center">Share files without the endless email threads—because simplicity is key!</p>
            </q-card-section>
          </q-card>
        </div>

        <!-- Feature Card 3 -->
        <div class="col-12 col-md-3">
          <q-card flat bordered class="bg-grey">
            <q-card-section>
              <h3 class="text-h5 text-center text-weight-bold">Video Calls</h3>
              <p class="text-center">Host video calls that are 50% more fun than your last one!</p>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>