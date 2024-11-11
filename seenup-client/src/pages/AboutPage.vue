<template>
  <!-- Main container for the About Us page -->
  <q-page class="q-pa-md text-primary q-pt-xl q-px-xl">
    <!-- Page title -->
    <p class="text-h4 text-weight-bold text-center">About Us</p>

    <!-- Main card container -->
    <q-card flat class="bg-grey">
      <!-- Section for the About Us content -->
      <q-card-section class="q-pt-none">
        <p>
          Hey there! We’re SeenUp, and if you’ve ever wished Slack could throw a party, dance like nobody’s watching, and throw in a few dad jokes for good measure, then you’ve come to the right place!
        </p>
        <p>
          <strong>Who Are We?</strong><br>
          We’re two tech enthusiasts, caffeine addicts, and meme connoisseurs who decided the world needed a communication tool that felt less like a corporate meeting and more like a virtual hangout. We realized that the workplace can be a little boring sometimes, and who says work can't be fun?
        </p>
        <p>
          <strong>Our Mission:</strong><br>
          To make collaboration feel less like an endless game of “Can you hear me now?” and more like a friendly chat over coffee (or energy drinks, if that’s your jam). With SeenUp, you’ll find the perfect blend of productivity and hilarity.
        </p>
        <p>
          <strong>What Makes Us Unique?</strong><br>
          - Emoji Overload: We believe every message deserves a proper emoji! Need to express excitement? There’s an emoji for that! Frustration? You bet! Just be careful not to overdo it—too many emojis can cause giggles in the workplace!
          <br><br>
          - Inspiring Productivity: Who knew that workplace productivity could be as thrilling as a rollercoaster ride? With our features, you'll be zooming through tasks faster than you can say "I love my job!"
          <br><br>
          - Chill Vibes Only: We promise no stuffy boardroom meetings. Just a good time with great tools. Because why should work feel like a chore?
        </p>
        <p>
          So, whether you’re collaborating on a top-secret project, planning a surprise party for your coworker, or just need to vent about that time the printer jammed (again), SeenUp has got your back. Let's make work fun together!
        </p>
        <p>
          Thanks for stopping by, and remember: <strong>Keep calm and SeenUp on!</strong>
        </p>
      </q-card-section>

      <!-- Section for the creators' information -->
      <q-card-section class="q-pt-md">
        <div class="text-h6 text-center">Meet the Creators</div>
        <div class="row q-mt-md justify-center">
          <!-- Creator: Matej Drienovský -->
          <div class="col-12 col-md-5 q-mr-md">
            <q-avatar size="150px" class="q-mb-md">
              <img src="/avatars/matko.jpg" alt="Matej Drienovský">
            </q-avatar>
            <div class="text-h6">Matej Drienovský</div>
            <div class="text-body1">Chief Fun Officer No.1</div>
            <p class="q-mt-md">Matej is the mastermind behind the SeenUp experience. When he’s not making work enjoyable, he’s probably hiking or plotting world domination... in a fun way!</p>
          </div>

          <!-- Creator: Tomáš Drga -->
          <div class="col-12 col-md-5 q-ml-md">
            <q-avatar size="150px" class="q-mb-md">
              <img src="/avatars/tomko.jpg" alt="Tomáš Drga">
            </q-avatar>
            <div class="text-h6">Tomáš Drga</div>
            <div class="text-body1">Chief Fun Officer No.2</div>
            <p class="q-mt-md">Tomáš is the mastermind behind the SeenUp experience. When he’s not making work enjoyable, he’s probably hiking or plotting world domination... in a fun way!</p>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>