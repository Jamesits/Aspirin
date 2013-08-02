$(function(){
  $("#back").on("touchstart",function(){
                window.location.assign("index.html");
                });
  $(".color").on("touchstart",function(e){
                 //$(".color").parents("li").buttonMarkup({ icon: "false" });
                 //$(".color").closest("ul").listview({ icon: false });
                 //$(".color").closest("ul").listview("refresh");
                 window.localStorage.setItem("Colorscheme",$(e.target).attr("data-value"));
                 //alert($(e.target).attr("data-value"));
                 $(e.target).parents("li").buttonMarkup({ icon: "check" });
                 });
  
  });
$(document).on("mobileinit", function(){
               $.mobile.defaultPageTransition = 'slide';
               $.mobile.page.prototype.options.domCache = true;
               //$.mobile.listview.prototype.options.icon = false;
               //$(".color").eq(window.localStorage.getItem("Colorscheme")).parents("li").buttonMarkup({ icon: "check" });
               $(".color").eq(window.localStorage.getItem("Colorscheme")).parents("li").attr("data-icon","check");
               });