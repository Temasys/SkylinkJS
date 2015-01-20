// global variables
var listWidth = 0;
var displayPrivateMode = false;
var mainMenus = ['#events', '#properties', '#methods', '#attrs', '#constructor'];
var menuItems = {
  '#method': '#methods',
  '#event': '#events',
  '#attr': '#attrs',
  '#property': '#properties'
};

var menuScrollTop = -1;

$(document).ready(function () {
  // seperate every arguments seperator
  $('.args').each(function () {
    var element = $(this);
    var length = $(element).find('.seperator').length;
    // remove the last item
    $(element).find('.seperator')[length - 1].remove();
  });
  // remove the [room=xxx] to room or [re] to re
  $('.args code').each(function () {
    var element = $(this);
    var elementHTML = $(element).html();
    if (elementHTML.indexOf('[') > -1) {
      elementHTML = elementHTML.replace(/\[(.*)(=)?(.*)\]/i, '$1');
    }
    // set the updated content
    $(element).html(elementHTML);
  });
  // remove extra space in prettify
  $('.example-content').each(function () {
    var element = $(this).find('.pln:last-child');
    $(element).html('&nbsp;&nbsp;');
  });
  // remove blockquotes
  $('.param-description').each(function () {
    var element = $(this);
    var elementHTML = $(element).html();
    // remove blockquotes
    if (elementHTML.indexOf('<blockquote>') > -1) {
      elementHTML = elementHTML.replace(/\<blockquote\>(.*)\<\/blockquote\>/i, '$1');
    }
    // parse [Rel: XXXX]
    if (elementHTML.indexOf('[Rel:') > -1) {
      var regexOutput = '<small><i class="fa fa-book"></i>&nbsp;&nbsp;' +
        'See also: <a href="#attr_$1">$1</a> for more information.</small>';
      elementHTML = elementHTML.replace(/\[Rel:\ Skylink\.([^.\]]+)([^\]]+|)\]/i, regexOutput);
    }
    // set the updated content
    $(element).html(elementHTML);
  });
  // seperate every code-item-trigger
  $('.code-item-trigger').each(function () {
    var element = $(this);
    var elementTriggerList = $(element).html().split(',');
    var elementOutputHTML = '';
    for (var i = 0; i < elementTriggerList.length; i++) {
      // fix for removing extra space
      elementTriggerList[i] = elementTriggerList[i].replace(/ /g, '');
      elementOutputHTML += '<a href="#event_' + elementTriggerList[i] +
        '" class="label label-primary">' + elementTriggerList[i] + '</a>';
    }
    $(element).html(elementOutputHTML);
  });
  // remove unwanted code information
  $('.code-item-information').each(function () {
    var element = $(this);
    if ($(element).find('span').length === 0) {
      $(element).hide();
    }
  });
  // set the private option
  $('#doc-type-select li').click(function () {
    var displayPrivate = $(this)[0].className.indexOf('private') > 1;
    setSelectedTab(window.location.hash || '#constructor', displayPrivate);
  });
  // scroll top
  $('.scroll-top').click(function () {
    scrollToHeader('');
  });
  // set the current window tab
  doSelectedTabUpdate();
  // set the scroll top
  menuScrollTop = $('#classdocs').offset().top - 155;
});


// check the select doc item
function setSelectedTab (currentSelectedTab, privateMode) {
  var itemToShow = '';
  var nativeItem = false;
  var isConstructor = false;

  $('.code-item').hide();
  $('.code-menu-item').hide();
  $('.code-item.private').hide();
  $('.code-menu-item.private').hide();

  // set the current private mode
  if (typeof privateMode === 'undefined') {
    var checkIfPrivate = $(window.location.hash);
    if ($(checkIfPrivate).length > 0) {
      $(window.location.hash)[0].className = $(window.location.hash)[0].className || '';
      displayPrivateMode =  $(window.location.hash)[0].className.indexOf('private-') > -1;
    }
  } else {
    displayPrivateMode = !!privateMode;
  }

  $('#doc-type-select li').removeClass('active')
  $('.doc-type-select-' + ((displayPrivateMode) ? 'private' : 'public')).addClass('active');

  if (currentSelectedTab === '#events' || currentSelectedTab.indexOf('#event_') === 0) {
    nativeItem = window.location.hash === '#events';

    if (displayPrivateMode) {
      itemToShow = '.private-event-item';
    } else {
      itemToShow = '.event-item';
    }
  } else if (currentSelectedTab === '#methods' || currentSelectedTab.indexOf('#method_') === 0) {
    nativeItem = window.location.hash === '#methods';
    displayPrivateMode = $(currentSelectedTab).hasClass('.private-method-item') || displayPrivateMode;

    if (displayPrivateMode) {
     itemToShow = '.private-method-item';
    } else {
      itemToShow = '.method-item';
    }
  } else if (currentSelectedTab === '#properties' || currentSelectedTab.indexOf('#property_') === 0) {
    nativeItem = window.location.hash === '#properties';
    if (displayPrivateMode) {
     itemToShow = '.private-property-item';
    } else {
      itemToShow = '.property-item';
    }
  } else if (currentSelectedTab === '#attrs' || currentSelectedTab.indexOf('#attr_') === 0) {
    nativeItem = window.location.hash === '#attrs';
    if (displayPrivateMode) {
      itemToShow = '.private-attr-item';
    } else {
     itemToShow = '.attr-item';
    }
  } else if (currentSelectedTab === '#constructor') {
    nativeItem = true;
    itemToShow = '.constructor-item';
    isConstructor = true;
  }
  if (itemToShow) {
    $(itemToShow)[(nativeItem) ? 'fadeIn' : 'show']().css('display', 'block');

    if (nativeItem) {
      scrollToHeader(itemToShow);
    }
  }
  // hide or show the private items and sidebar for constructor
  $('.section-doc-group .col-md-3')[(isConstructor) ? 'addClass' : 'removeClass']('constructor');
  $('.doc-content')[(isConstructor) ? 'addClass' : 'removeClass']('constructor');
  $('#doc-type-select')[(isConstructor) ? 'addClass' : 'removeClass']('constructor');
  // temporary fix to hide constructor
  $('#constructor')[(isConstructor) ? 'show' : 'hide']();
  // show or hide the messaging tab
  $('.nav-links')[(displayPrivateMode) ? 'show' : 'hide']();
  scrollToItem(window.location.hash || currentSelectedTab);
}

function scrollToHeader (itemToShow) {
  // animate to header bar
  $('html, body').animate({
    scrollTop: $('#doc-type-select').offset().top - $('#hd').height() - 15
  }, 350);
  // select the first element
  $('.list-group-item' + itemToShow).removeClass('active');
  $($('.list-group-item' + itemToShow)[0]).addClass('active');
}

function scrollToItem (itemToShow) {
  if (mainMenus.indexOf(itemToShow) === -1) {
    if ($(itemToShow).length > 0) {
      $('html, body').animate({
        scrollTop: $(itemToShow).offset().top - $('#hd').height() - 15
      }, 350);
    }
  }
}

// select the active doc item
function doSelectedTabUpdate () {
  // switch tabs
  $('.doc-selected.active').removeClass('active');

  var typeOfMenuItem = mainMenus.indexOf(window.location.hash || '#constructor');
  // check if parent menu item selected or child menu item
  if (typeOfMenuItem === -1) {
    typeOfMenuItem = mainMenus.indexOf(menuItems[window.location.hash.split('_')[0]]);
  }
  var item = $('.doc-selected a[href="' + mainMenus[typeOfMenuItem] + '"]');
  $(item).parent('.doc-selected').addClass('active');
  $('.list-group-o-wrapper .title').html($(item).html());
  $('#current-doc-selected-title').html($(item).html());
  $('.doc-private-label').html($(item).html());
  setSelectedTab($(item).attr('href'));
};


// on click change active selected
$(window).on('hashchange', function(e){
  doSelectedTabUpdate();
});


$(window).scroll(function(){
  var scrollTop = $(this).scrollTop();
  var elementListWrapper = $('.list-group-o-wrapper');
  var elementList = $(elementListWrapper).find('.list-group-wrapper');
  // set the width
  listWidth = $(elementListWrapper).width();

  // set the documentation
  if (menuScrollTop !== -1) {
    if (scrollTop > menuScrollTop) {
      if (!$('#classdocs').hasClass('scroll-fix-navbar')) {
        $('#classdocs, #doc-type-select').addClass('scroll-fix-navbar navbar-fixed-top container');
      }
    } else {
      if ($('#classdocs').hasClass('scroll-fix-navbar')) {
        $('#classdocs, #doc-type-select').removeClass('scroll-fix-navbar navbar-fixed-top container');
      }
    }
  }

  if(($('#current-doc-selected-title').offset().top - $('#hd').height()) > scrollTop) {
    // get current width
    // remove the scrollbar top
    $(elementListWrapper).removeClass('fixed-top');
    $(elementList).css('min-height', '');
    $(elementList).height('auto');
    $(elementList).width('auto');
  } else {
    // set scrollbar to top
    $(elementListWrapper).addClass('fixed-top');
    $(elementList).css('min-height', ($(window).height() - 125 - 55 - 120) + 'px');
    $(elementList).height($(window).height() - 125 - 55 - 120);
    $(elementList).width(listWidth);

    console.info('text', $('.list-group-o-wrapper .title').html());
    // set the selected item
    $('.doc-content .code-item').each(function () {
      var element = $(this);
      if ($(element).is(':visible')) {
        var topDistance = $(element).offset().top;
        if((topDistance + $(element).height() - 55) > (scrollTop)) {
          $('.code-menu-item').removeClass('active');
          $('a[href="#' + $(element).attr('id') + '"]').addClass('active');
          return false;
        }
      }
    });
  }
});
