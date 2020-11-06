$(document).ready(function()   {

  $('.toggle').click(function() {
    $('.button_container').toggleClass('active-btn');
    $('#overlay').toggleClass('open');
    $('.logo-panel').toggleClass('logo-open');
    $('#top-panel-mob').toggleClass('panel-open');
  }); 
  
});