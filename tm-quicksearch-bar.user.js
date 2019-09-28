// ==UserScript==
// @name         Quick Search Bar
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Adds quicksearch bar
// @author       Tyler Chamberlain
// @match        https://act.betoorourke.com/signup/*
// @grant        unsafeWindow
// @require      https://code.jquery.com/jquery-1.8.3.min.js
// @require      https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js
// ==/UserScript==

$(document).ready((function(){
    addQuickSearchBar();
})());

function addQuickSearchBar() {
    var baseElement = $('body');
    var html = '<div id="quicksearch" style="background-color:white; text-align: center; padding-bottom:0.5em; top:0; right:0;">\n' +
        '                Quick Search Bar<br/>\n' +
        '                <table class="quick-links">\n' +
        '                    <tr>\n' +
        '                        <td>\n' +
        '                            <img src="https://hexarobi.com/person-search/img/people_search_now.png" style="width:8em;" />\n' +
        '                        </td>\n' +
        '                        <td>\n' +
        '                            <a href="" class="search-psn-name button">Name</a>\n' +
        '                            <a href="" class="search-psn-phone button">Phone</a>\n' +
        '                            <a href="" class="search-psn-address button">Address</a>\n' +
        '                        </td>\n' +
        '                    </tr>\n' +
        '                    <tr>\n' +
        '                        <td>\n' +
        '                            <img src="https://hexarobi.com/person-search/img/true_people_search.png" style="width:8em;" />\n' +
        '                        </td>\n' +
        '                        <td>\n' +
        '                            <a href="" class="search-tps-name button">Name</a>\n' +
        '                            <a href="" class="search-tps-phone button">Phone</a>\n' +
        '                            <a href="" class="search-tps-address button">Address</a>\n' +
        '                        </td>\n' +
        '                    </tr>\n' +
        '                    <tr>\n' +
        '                        <td>\n' +
        '                            Other\n' +
        '                        </td>\n' +
        '                        <td>\n' +
        '                            <a href="" class="search-zip-streets button">Streets in Zip</a>\n' +
        '                            <!--<a href="" class="search-email-validator button" target="_blank">Email Validator</a>-->\n' +
        '                        </td>\n' +
        '                    </tr>\n' +
        '                </table>\n' +
        '                <iframe id="peoplesearch_frame" style="width:100%;height:100%;" src="https://www.peoplesearchnow.com/"></iframe>'
        + '            </div>'
        + '<style>#quicksearch { border:1px solid black; height:100vh; width:30%; position:fixed; right:0; }'
        + '#quicksearch-main-content { float:left; width:70%; } table.quick-links { margin:0 auto; } table.quick-links tr td { padding:0.1em;}'
        + '.button { font: bold 11px Arial; text-decoration: none; background-color: #EEEEEE; color: #333333; padding: 2px 6px 2px 6px; '
        + 'border-top: 1px solid #CCCCCC; border-right: 1px solid #333333; border-bottom: 1px solid #333333; border-left: 1px solid #CCCCCC; }</style>';
    baseElement.css('padding-right', '20em');
    baseElement.append(html);
    addQuicksearchLinks();
}

function addQuicksearchLinks() {

    $('.search-psn-phone').click(function () {
        return searchPsnPhone();
    });
    $('.search-psn-name').click(function () {
        return searchPsnName();
    });
    $('.search-psn-address').click(function () {
        return searchPsnAddress();
    });

    $('.search-tps-phone').click(function () {
        return searchTpsPhone();
    });
    $('.search-tps-name').click(function () {
        return searchTpsName();
    });
    $('.search-tps-address').click(function () {
        return searchTpsAddress();
    });

    $('.search-zip-streets').click(function () {
        return searchMelissaStreetsByZip();
    });

}

function changeSearchFrame(searchUrl) {
    $('#peoplesearch_frame').attr('src', searchUrl);
    return false;
}

function searchMelissaStreetsByZip() {
    if (! validateZipSearch()) {
        return false;
    }
    // http://www.melissadata.com/lookups/zipstreet.asp?InData=78745&c=-1&l=U
    var params = [
        { name: "InData", value: $('#id_zip').val() },
        { name: "c", value: "-1" },
        { name: "l", value: "u" }
    ];
    var searchUrl = 'https://www.melissadata.com/lookups/zipstreet.asp' + '?' + $.param(params);
    return changeSearchFrame(searchUrl);
}

function searchTpsName() {
    if (! validateNameSearch()) {
        return false;
    }
    // https://www.truepeoplesearch.com/results?name=Tyler%20Chamberlain&citystatezip=Austin,%20TX
    var params = [
        { name: "name", value: $('#id_first_name').val() + ' ' + $('#id_last_name').val() },
        { name: "citystatezip", value: $('#id_city').val() + ', ' + $('#id_state').val() + ' ' + $('#id_zip').val() }
    ];
    var personSearchUrl = 'https://www.truepeoplesearch.com/results';
    var searchUrl = personSearchUrl + '?' + $.param(params);

    return changeSearchFrame(searchUrl);
}

function searchTpsAddress() {
    if (! validateAddressSearch()) {
        return false;
    }
    // https://www.truepeoplesearch.com/results?streetaddress=3009%20BUSHNELL%20DR&citystatezip=Austin,%20TX
    var params = [
        { name: "streetaddress", value: $('#id_address1').val() + ' ' + $('#id_address2').val() },
        { name: "citystatezip", value: $('#id_city').val() + ', ' + $('#id_state').val() + ' ' + $('#id_zip').val() }
    ];
    var personSearchUrl = 'https://www.truepeoplesearch.com/results';
    var searchUrl = personSearchUrl + '?' + $.param(params);

    return changeSearchFrame(searchUrl);
}

function searchTpsPhone() {
    if (! validatePhoneSearch()) {
        return false;
    }
    // https://www.truepeoplesearch.com/results?phoneno=(817)996-4503
    var params = [
        { name: "phoneno", value: $('#id_phone').val() }
    ];
    var searchUrl = 'https://www.truepeoplesearch.com/results' + '?' + $.param(params);
    return changeSearchFrame(searchUrl);
}

function searchPsnAddress() {
    if (! validateAddressSearch()) {
        return false;
    }
    var addressSearchUrl = 'https://www.peoplesearchnow.com/address/';
    var addressSearchKey = buildPeopleSearchNowUrlAddressKey(
        $('#id_address1').val().toLowerCase(),
        "",
        $('#id_city').val().toLowerCase(),
        $('#id_state').val().toLowerCase()
    );
    return changeSearchFrame(addressSearchUrl + addressSearchKey);
}

function buildPeopleSearchNowUrlAddressKey(streetNumber, streetName, city, state) {
    var searchKey = streetNumber + '_' + streetName + '_' + city + '_' + state;
    searchKey = searchKey.replace(" ", "-");
    return searchKey;
}

function searchPsnName() {
    if (! validateNameSearch()) {
        return false;
    }

    var personSearchUrl = 'https://www.peoplesearchnow.com/person/';
    var personNameKey = $('#id_first_name').val().toLowerCase() + '-' + $('#id_last_name').val().toLowerCase();
    var cityKey = $('#id_city').val().toLowerCase() + '_' + $('#id_state').val().toLowerCase();

    var searchUrl = personSearchUrl + personNameKey + '_' + cityKey;

    return changeSearchFrame(searchUrl);
}

function searchPsnPhone() {
    if (! validatePhoneSearch()) {
        return false;
    }
    var phoneSearchUrl = 'https://www.peoplesearchnow.com/phone/';
    var unformattedPhoneNumber = $('#id_phone').val();
    var formatedPhoneNumber = unformattedPhoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    return changeSearchFrame(phoneSearchUrl + formatedPhoneNumber);
}


function validateNameSearch() {
    if ($('#id_first_name').val() === ""
        || $('#id_last_name').val() === ""
        || $('#id_city').val() === ""
    ) {
        alert("Must enter a first name, last name, and city to search by name");
        return false;
    }
    return true;
}

function validateAddressSearch() {
    if ($('#id_address1').val() === ""
        || $('#id_city').val() === ""
        || $('#id_state').val() === ""
    ) {
        alert("Must enter an address and city to search by address");
        return false;
    }
    return true;
}

function validateZipSearch() {
    if ($('#id_zip').val() === "") {
        alert("Must enter a zipcode to search by zip");
        return false;
    }
    return true;
}

function validatePhoneSearch() {
    if ($('#id_phone').val().length != 10) {
        alert("Phone number must be exactly 10 digits to search by phone number");
        return false;
    }
    return true;
}
