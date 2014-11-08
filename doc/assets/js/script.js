// global variables
var listWidth = 0;
var displayPrivateMode = false;


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
      elementHTML = elementHTML.replace(/\[Rel:(\ Skylink\.)?(.*)\]/i, regexOutput);
    }
    // set the updated content
    $(element).html(elementHTML);
  });
  // [GLOBAL VARIABLE], [DEVELOPMENT] parsing
  $('.code-item').each(function () {
    var element = $(this);
    var elementDesc = $(this).find('.code-item-description');
    var elementDescHTML = $(elementDesc).html();
    // replace [GLOBAL VARIABLE]
    if (elementDescHTML.indexOf('[GLOBAL VARIABLE]') > -1) {
      elementDescHTML = elementDescHTML.replace('[GLOBAL VARIABLE]', '');
      $(element).find('.label-global').show();
    }
    // replace [DEVELOPMENT]
    if (elementDescHTML.indexOf('[DEVELOPMENT]') > -1) {
      elementDescHTML = elementDescHTML.replace('[DEVELOPMENT]', '');
      $(element).find('.label-development').show();
    }
    // set the updated content
    $(elementDesc).html(elementDescHTML);
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
  $('#doc-private-select').click(function () {
    var selectedIcon = 'fa-check-square-o';
    var unselectedIcon = 'fa-square-o';
    var elementIcon = $(this).find('.fa');
    // update the private mode
    currentPrivateMode = $(this).attr('state') === 'true';
    displayPrivateMode = !currentPrivateMode;

    // update the current state
    $(this).attr('state', displayPrivateMode.toString());

    // set the icons
    $(elementIcon).addClass((displayPrivateMode) ?
      selectedIcon : unselectedIcon);

    $(elementIcon).removeClass((displayPrivateMode) ?
      unselectedIcon : selectedIcon);

    // set the text
    $('.doc-private-info').html((displayPrivateMode) ?
      'Hide Skylink Private' : 'Show Skylink Private')

    // set the selected tab
    setSelectedTab(window.location.hash || '#methods');
  });
  // set the current window tab
  doSelectedTabUpdate();
});


// check the select doc item
function setSelectedTab (currentSelectedTab) {
  var itemToShow = '';
  var nativeItem = false;

  $('.code-item').hide();
  $('.code-menu-item').hide();
  $('.code-item.private').hide();
  $('.code-menu-item.private').hide();

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
  }
  if (itemToShow) {
    $(itemToShow)[(nativeItem) ? 'fadeIn' : 'show']().css('display', 'block');
  }
};

// select the active doc item
function doSelectedTabUpdate () {
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
  doSelectedTabUpdate();
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