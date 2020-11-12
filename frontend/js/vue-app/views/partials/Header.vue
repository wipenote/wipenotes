<template>
  <header>

    <nav class="container d-lg-none">
      <h1 class="header__logo" src="images/logo.svg" alt="Logo">WipeNote</h1>
			<div class="button_container toggle">
				<span class="top"></span>
				<span class="middle"></span>
				<span class="bottom"></span>
			</div>
			<div class="container-ham">
				<div id="overlay" class="overlay">
					<div id="navbar" class="overlay-menu">

						<div class="container">
              <!-- <div class="row"> -->
                <div class="footer__col">
                  <h3 class="footer__title">Why can you trust us?</h3>
                  <a class="footer__link" href="#">Github</a>
                  <a class="footer__link" href="#">About us</a>
                </div>
                <div class="footer__col-middle">
                  <h3 class="footer__title">Donate (btc)</h3>
                  <button class="footer__copy">
                    <span class="footer__copy-icon"><img src="images/copy.svg" alt="copy"></span>
                    1BQ9qza7fn9snSCyJQB3Z<br>cN46biBtkt4ee
                  </button>
                </div>
                <div class="footer__col">
                  <h3 class="footer__title-copyright">WipeNote</h3>
                  <p class="footer__copyright" href="#">© 2020 WipeNote</p>
                  <a class="footer__link" href="mailto:info@wipenote.io">info@wipenote.io</a>
                </div>
              <!-- </div> -->
            </div>

					</div>
				</div>
			</div>			
		</nav>

    <div class="container d-none d-lg-block">
      <div class="header__row row">
        <!-- <img class="header__logo" src="/assets/images/logo.svg" alt="Logo" class="logo"> -->
        <h1 class="header__logo logo">WipeNote</h1>
        <div class="header__right">
          <img class="header__logo-github" src="../../assets/images/github.svg" alt="github">
          <a class="header__trust" href="#">Why can you trust us?</a>
        </div>
      </div>
    </div>
  </header>

</template>

<script>
  export default {
    name: 'Header',
    props: {
    }
  }
</script>
