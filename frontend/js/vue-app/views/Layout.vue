<template>
  <fragment>
    <div class="container">
      <router-view />
    </div>

  </fragment>
</template>

<script>
  import Header from "./partials/Header.vue";
  import Footer from "./partials/Footer.vue";

  export default {
    name: 'Layout',
    props: {
    },
    components: {
      Header,
      Footer,
    }
  }
</script>
