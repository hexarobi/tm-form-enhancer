// ==UserScript==
// @name         Form Enhancer
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  Adds address autocomplete and email verification to forms
// @author       Tyler Chamberlain
// @match        https://act.betofortexas.com/*
// @grant        unsafeWindow
// @require      https://code.jquery.com/jquery-1.8.3.min.js
// @require      https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js
// ==/UserScript==

var autocomplete;
var componentForm = {
    street_number: 'short_name',
    route: 'long_name',
    locality: 'long_name',
    administrative_area_level_1: 'short_name',
    country: 'long_name',
    postal_code: 'short_name'
};

$(document).ready((function(){
    addAddressSearchField();
    addGmapsResultsHiddenFields();
    addEmailVerificationIcons();

    addScriptToPage("https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js");
    $('input').selectable();

    unsafeWindow.gMapsCallback = function(){
        $(window).trigger('gMapsLoaded');
    }
    function initialize(){
        autocomplete = new google.maps.places.Autocomplete(
            /** @type {!HTMLInputElement} */(document.getElementById('autocomplete')),
            {types: ['geocode']});

        // When the user selects an address from the dropdown, populate the address
        // fields in the form.
        autocomplete.addListener('place_changed', fillInAddress);

        preventEnterKeyOnAutocompleteFromSubmittingForm();
    }
    function loadGoogleMaps(){
        addScriptToPage("https://maps.google.com/maps/api/js?key=AIzaSyCTvqo_E9I-pNzIbyY32widD4HboRyQnik&libraries=places&callback=gMapsCallback");
    }
    $(window).bind('gMapsLoaded', initialize);
    loadGoogleMaps();

})());

// Add the search bar for address autocomplete
function addAddressSearchField() {
    $('#ak-fieldbox-address1').before(
        '<div id="ak-fieldbox-address-search" class="ak-err-below">'
        + '<label for="autocomplete" class="ak-is-overlaid" style="cursor: text; pointer-events: none;"></label>'
        + '<input type="text" name="address_search" id="autocomplete" class="ak-userfield-input" role="presentation" autocomplete="nope" placeholder="Search for an address"></div>'
    );
}

// Add the hidden fields required for address autocomplete
function addGmapsResultsHiddenFields() {
    var html = '<input type="hidden" name="street_number" id="street_number" />'
        + '<input type="hidden" name="route" id="route" />'
        + '<input type="hidden" name="apt_num" id="apt_num" />'
        + '<input type="hidden" name="locality" id="locality" />'
        + '<input type="hidden" name="administrative_area_level_1" id="administrative_area_level_1" />'
        + '<input type="hidden" name="postal_code" id="postal_code" />'
        + '<input type="hidden" name="country" id="country" />';
    $('body').append(html);
}

function addEmailVerificationIcons() {
    var html = '<div style="position: absolute;float:right;width: 100%;"><div style="position:absolute;right:0.4em;top:0.4em;">'
        + '<img class="js-email-icon-valid email-icon" src="http://hexarobi.com/person-search/img/icons8-ok-48.png" alt="Valid">'
        + '<img class="js-email-icon-invalid email-icon" src="http://hexarobi.com/person-search/img/icons8-cancel-48.png" alt="Invalid">'
        + '<img class="js-email-icon-unknown email-icon" src="http://hexarobi.com/person-search/img/icons8-help-48.png" alt="Unknown"">'
        + '<img class="js-email-icon-loading email-icon" src="http://hexarobi.com/person-search/img/loading.gif" alt="Loading"">'
        + '<div></div>'
        + '<style>.email-icon { width:2em; height:2em; display:none; }</style>'
    ;
    $('#id_email').before(html);

    $('#id_email').change(function () {
        return validateEmailAddress($('#id_email').val());
    });
}
function validateEmailAddress(emailAddress) {
    setEmailStatusIcon('loading');
    validateEmailAddressWithTrumail(emailAddress);
}

function setEmailStatusIcon(state) {
    $('.email-icon').hide();
    $('.js-email-icon-' + state).show();
}

function validateEmailAddressWithMailgun(emailAddress) {
    $.ajax({
        type: "GET",
        url: 'https://api.mailgun.net/v2/address/validate',
        data: {
            "address": emailAddress,
            "api_key": "pubkey-3ffe370c333abe90f519cdea68c94303"
        },
        crossDomain: true,
        dataType: "json",
        success: function( data ) {
            $('#email-validation-loader').hide();
            if (data.is_valid && data.mailbox_verification === "true") {
                setEmailStatusIcon('valid');
            } else {
                setEmailStatusIcon('invalid');
            }
        },
        error: function() {
            setEmailStatusIcon('unknown');
        }
    });
}

function validateEmailAddressWithTrumail(emailAddress) {
    var emailValidationUrl = 'https://api.trumail.io/v2/lookups/json?email=' + emailAddress;
    $.get( emailValidationUrl, function( data ) {
        if (data) {
            if (data.Message) {
                if (data.Message == 'No response received from mail server'
                    || data.Message == "Rate limit exceeded - If you'd like a higher request volume please contact sales@emailchecker.com"
                ) {
                    return validateEmailAddressWithMailgun(emailAddress);
                }
                //setEmailStatusIcon('unknown');
                // If free email check failed, fallback to paid
                alert(data.Message);
            } else if (data.deliverable) {
                setEmailStatusIcon('valid');
            } else {
                setEmailStatusIcon('invalid');
            }
        }
    });
}

function preventEnterKeyOnAutocompleteFromSubmittingForm() {
    // Pressing enter when using the address autocomplete bar shouldn't submit the form
    var input = document.getElementById('autocomplete');
    google.maps.event.addDomListener(input, 'keydown', function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
        }
    });
}

function addScriptToPage(url) {
    var script_tag = document.createElement('script');
    script_tag.setAttribute("type","text/javascript");
    script_tag.setAttribute("src",url);
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
}

function fillInAddress() {
    // Get the place details from the autocomplete object.
    var place = autocomplete.getPlace();

    for (var component in componentForm) {
        console.log(component);
        document.getElementById(component).value = '';
        document.getElementById(component).disabled = false;
    }

    // Get each component of the address from the place details
    // and fill the corresponding field on the form.
    for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0];
        if (componentForm[addressType]) {
            var val = place.address_components[i][componentForm[addressType]];
            document.getElementById(addressType).value = val;
        }
    }

    // copy from hidden fields to visible fields
    $('#id_address1').val( $('#street_number').val() + ' ' + $('#route').val() );
    $('#id_city').val( $('#locality').val() );
    $('#id_state').val( $('#administrative_area_level_1').val() );
    $('#id_zip').val( $('#postal_code').val() );

    // hide placeholders
    $("label[for='id_address1']").addClass('has-content');
    $("label[for='id_city']").addClass('has-content');
    $("label[for='id_state']").addClass('has-content');
    $("label[for='id_zip']").addClass('has-content');
}

// Clean names
$('#id_first_name').change(function () {
    $('#id_first_name').val(
        cleanNameInput($('#id_first_name').val())
    );
});
$('#id_last_name').change(function () {
    $('#id_last_name').val(
        cleanNameInput($('#id_last_name').val())
    );
});
$('body').append('<style>#id_first_name, #id_last_name { text-transform:capitalize; }</style>');

function cleanNameInput(string) {
    string = string.trim();
    return string.charAt(0).toUpperCase() + string.slice(1);
}
