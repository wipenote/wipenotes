<template>
  <footer class="footer">
    <div class="container">
      <div class="row">
        <div class="footer__col col-md-3">
          <h3 class="footer__title">Why can you trust us?</h3>
          <a class="footer__link" href="#">Github</a>
          <a class="footer__link" href="#">About us</a>
        </div>
        <div class="footer__col-middle col-md-6">
          <h3 class="footer__title">Donate (btc)</h3>
          <button class="footer__copy">
          <span class="footer__copy-icon">
            <img src="../../assets/images/copy.svg" alt="copy">
          </span>
            1BQ9qza7fn9snSCyJQB3Z<br>cN46biBtkt4ee
          </button>
        </div>
        <div class="footer__col footer__col_last col-md-3">
          <h3 class="footer__title-copyright">WipeNote</h3>
          <p class="footer__copyright">© 2020 WipeNote</p>
          <a class="footer__link" href="mailto:info@wipenote.io">
            info@wipenote.io
          </a>
        </div>
      </div>
    </div>
  </footer>

</template>

<script>
  export default {
    name: 'Footer',
    props: {
    }
  }
</script>
