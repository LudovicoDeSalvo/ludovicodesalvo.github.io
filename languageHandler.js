$(function () {
  function langButtonListen() {
    $("#langToEn").click(function (event) {
      event.preventDefault();
      $('[lang="it"]').hide();
      $('[lang="en"]').show();
      $.cookie("lang", "en", { expires: 7 });
    });

    $("#langToIt").click(function (event) {
      event.preventDefault();
      $('[lang="en"]').hide();
      $('[lang="it"]').show();
      $.cookie("lang", "it", { expires: 7 });
    });
  }

  // check if language cookie already exists
  if ($.cookie("lang")) {
    var lang = $.cookie("lang");
    if (lang === "en") {
      $('[lang="it"]').hide();
      $('[lang="en"]').show();
      langButtonListen();
    } else {
      $('[lang="en"]').hide();
      $('[lang="it"]').show();
      langButtonListen();
    }
  } else {
    // default to ita
    $('[lang="en"]').hide();
    $.cookie("lang", "it", { expires: 7 });
    langButtonListen();
  }
});
