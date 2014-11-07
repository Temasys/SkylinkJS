var listWidth = 0;
var displayPrivateMode = false;
$(document).ready(function () {
  // seperate every arguments seperator
  $('.args').each(function () {
    var length = $(this).find('.seperator').length;
    // remove the last item
    $(this).find('.seperator')[length - 1].remove();
  });
  // remove extra space in prettify
  $('.example-content').each(function () {
    $(this).find('.pln:last-child').html('&nbsp;&nbsp;');
  });
  // remove blockquotes
  $('.param-description').each(function () {
    if ($(this).html().indexOf('<blockquote>') > -1) {
      $(this).html($(this).html().replace(/<blockquote>/g, ''));
      $(this).html($(this).html().replace(/<\/blockquote>/g, ''));
    }
  });
  // [GLOBAL VARIABLE], [DEVELOPMENT] parsing
  $('.code-item').each(function () {
    var codeDescription = $(this).find('.code-item-description');
    if ($(codeDescription).html().indexOf('[GLOBAL VARIABLE]') > -1) {
      $(codeDescription).html(
        $(codeDescription).html().replace('[GLOBAL VARIABLE]', ''));
      $(this).find('.label-global').show();
    }
    if ($(codeDescription).html().indexOf('[DEVELOPMENT]') > -1) {
      $(codeDescription).html(
        $(codeDescription).html().replace('[DEVELOPMENT]', ''));
      console.info($(this).find('.label-development'));
      $(this).find('.label-development').show();
    }
  });
  // seperate every code-item-trigger
  $('.code-item-trigger').each(function () {
    var content = $(this).html().split(',');
    var outputContent = '';
    for (var i = 0; i < content.length; i++) {
      // fix for removing extra space
      content[i] = content[i].replace(/ /g, '');
      outputContent += '<a href="#event_' + content[i] + '" class="label label-primary">' + content[i] + '</a>';
    }
    $(this).html(outputContent);
  });
  // set the current window tab
  doSelectedUpdate();
  // remove unwanted code information
  $('.code-item-information').each(function () {
    if ($(this).find('span').length === 0) {
      $(this).hide();
    }
  });
  // set the private option
  $('#doc-private-select').click(function () {
    currentPrivateMode = $(this).attr('state') === 'true';
    displayPrivateMode = !currentPrivateMode;
    console.info(displayPrivateMode);
    $(this).attr('state', displayPrivateMode.toString());
    console.info($(this).attr('selected'));
    $(this).find('.fa').addClass((displayPrivateMode) ?
      'fa-check-square-o' : 'fa-square-o');
    $(this).find('.fa').removeClass((displayPrivateMode) ?
      'fa-square-o' : 'fa-check-square-o');
    $('.doc-private-info').html((displayPrivateMode) ?
      'Hide Skylink Private' : 'Show Skylink Private')
    setSelectedTab(window.location.hash || '#methods');
  });
});
// check the select doc item
function setSelectedTab (currentSelectedTab) {
  $('.code-item').hide();
  $('.code-menu-item').hide();
  $('.code-item.private').hide();
  $('.code-menu-item.private').hide();
  var itemToShow = '';
  var nativeItem = false;

  if (currentSelectedTab === '#events' || currentSelectedTab.indexOf('#event_') === 0) {
    nativeItem = window.location.hash === '#events';
    if (displayPrivateMode) {
      itemToShow = '.private-event-item';
    } else {
      itemToShow = '.event-item';
    }
  } else if (currentSelectedTab === '#methods' || currentSelectedTab.indexOf('#method_') === 0) {
    nativeItem = window.location.hash === '#methods';
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
  } else {
    $('.code-item').hide();
    $('.code-menu-item').hide();
    $('.code-item.private').hide();
    $('.code-menu-item.private').hide();
  }
  if (itemToShow) {
    $(itemToShow)[(nativeItem) ? 'fadeIn' : 'show']().css('display', 'block');
  }
};
// select the active doc item
function doSelectedUpdate () {
  // switch tabs
  $('.doc-selected.active').removeClass('active');
  var mainMenus = ['#events', '#properties', '#methods', '#attrs'];
  var menuItems = {
    '#method': '#methods',
    '#event': '#events',
    '#attr': '#attrs',
    '#property': '#properties'
  };
  var typeOfMenuItem = mainMenus.indexOf(window.location.hash || '#methods');
  // check if parent menu item selected or child menu item
  if (typeOfMenuItem === -1) {
    typeOfMenuItem = mainMenus.indexOf(menuItems[window.location.hash.split('_')[0]]);
  }
  var item = $('.doc-selected a[href="' + mainMenus[typeOfMenuItem] + '"]');
  $(item).parent('.doc-selected').addClass('active');
  console.info(item);
  $('.list-group-o-wrapper .title').html($(item).html());
  $('#current-doc-selected-title').html($(item).html());
  $('.doc-private-label').html($(item).html());
  setSelectedTab($(item).attr('href'));
};

// on click change active selected
$(window).on('hashchange', function(e){
  doSelectedUpdate();
});

$(window).bind('scroll', function() {
  var scrollTop = $(this).scrollTop();
  if(($('#current-doc-selected-title').offset().top) > scrollTop) {
    // get current width
    // remove the scrollbar top
    $('.list-group-o-wrapper').css('position', '');
    $('.list-group-o-wrapper').css('top', '');
    $('.list-group-o-wrapper').find('.list-group-wrapper').css('min-height', '');
    $('.list-group-o-wrapper').find('.list-group-wrapper').height('auto');
    $('.list-group-o-wrapper').width('auto');
    $('.list-group-o-wrapper .title').hide().css('display', 'none');
  } else {
    // set scrollbar to top
    listWidth = $('.list-group-wrapper').width();

    $('.list-group-o-wrapper').css('position', 'fixed');
    $('.list-group-o-wrapper').css('top', '65px');
    $('.list-group-o-wrapper').find('.list-group-wrapper').css('min-height', ($(window).height() - 125) + 'px');
    $('.list-group-o-wrapper').find('.list-group-wrapper').height($(window).height() - 125);
    $('.list-group-o-wrapper').width(listWidth);
    $('.list-group-o-wrapper .title').show().css('display', 'block');
    // set the selected item
    $('.doc-content .code-item').each(function () {
      if ($(this).is(':visible')) {
        var topDistance = $(this).offset().top;
        if((topDistance + $(this).height() - 55) > (scrollTop)) {
          $('.code-menu-item').removeClass('active');
          $('a[href="#' + $(this).attr('id') + '"]').addClass('active');
          return false;
        }
      }
    });
  }
});