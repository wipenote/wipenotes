<template>
  <div class="form">
    <div class="window">
      <div class="form__wrapper-img">
        <div class="form__top">
          <div class="textarea__wrapper">

            <p>
              We have developed a simple and convenient service for quick and secure information exchange.
            </p>

            <p>
              WipeNote is a free online service that allows you to send any secret information over the Internet. It's easy to use, and you don't have to register.
            </p>

            <p>
              Share your messages, links, and files without worrying about being hacked or tracked. Reply with messages to shared information.
            </p>

            <p>
              Your message can be discarded upon reading or can be stored for a specified period.
            </p>
          </div>

        </div>
      </div>
      <div class="form__bottom">

      </div>

    </div>

    <router-link class="button__submit button__submit_link" to="/">
      Create note
    </router-link>

  </div>

</template>

<script>
  export default {
    name: 'AboutUs',
    methods: {
      navigateToCreateNote() {
        this.$router.push({name: 'home'})
      }
    }
  }
</script>
