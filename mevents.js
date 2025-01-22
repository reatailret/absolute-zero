/**
 * Mobile GUI for the chemistry DB
 * Version: 0.5.5ce
 */
"use strict";

function register_events(){

    $('#search_trigger').click(function(){
        var search_obj = wmgui.selectize.read();

        var urlstr = $.param(search_obj);
        if (window.location.hash == '#inquiry/' + urlstr){
            // hash-hack FIXME?
            if (urlstr.slice(-1) == '=') urlstr = urlstr.substr(0, urlstr.length-1);
            else                         urlstr += '=';
        }
        window.location.hash = '#inquiry/' + urlstr;
        return false;
    });

    $('#mini_branding').click(function(){
        window.location.hash = '#start';
    });

    $('#legend').on('click', 'a', function(){
        var that = $(this),
            search_obj = {},
            second_facet = that.attr('data-facet-b');
        search_obj[ that.attr('data-facet-a') ] = that.attr('data-term-a');

        if (search_obj[second_facet] && second_facet == 'elements'){
            search_obj[second_facet] += '-' + that.attr('data-term-b');

        } else if (search_obj[second_facet] && second_facet == 'classes'){
            search_obj[second_facet] += ',' + that.attr('data-term-b');

        } else search_obj[second_facet] = that.attr('data-term-b');

        window.location.hash = '#inquiry/' + $.param(search_obj);
        return false;
    });

    $('#input').on('click', 'li', function(){
        var link = $(this).attr('rel');
        if (!!link){ // search only ... arity
            window.location.hash = link;
            return;
        }
        window.scrollTo(0, document.body.scrollHeight);
        $('#search_field-selectized').focus();
    });

    $('#summary').on('click', 'a.extd_refine', function(){
        var facet = $(this).attr('rel'),
            given_search = {extd_refine: facet};
        $.extend(given_search, wmgui.search);
        $.ajax({type: 'GET', url: wmgui.rfn_endpoint, data: {q: JSON.stringify(given_search)}}).done(function(data){
            if (data.error) return wmgui.notify(data.error);
            var html = '';
            delete given_search['extd_refine'];

            $.each(data.payload, function(i, found){
                // FIXME: duplicating
                var link_text = found[0],
                    orepr = {};
                $.each(given_search, function(key, val){
                    if (facet == 'elements' && (key == 'elements' || key == 'formulae')) return true;
                    else if (facet == 'props' && key == 'props') return true;
                    orepr[key] = val;
                });
                if (facet == 'props'){
                    found[0] = found[0].replace(/\(|\)/g, "").replace(/\/[\w\-]*/g, ""); // FIXME!
                }
                orepr[facet] = found[0];
                if (orepr['elements']) orepr['elements'] = orepr['elements'].replaceAll(', ', '-');

                html += '<li class="extd_rfns fct_' + facet + '"><a href="#inquiry/' + $.param(orepr) + '">' + link_text + '</a></li>';
            });
            $('a.extd_refine[rel=' + facet + ']').parent().hide().after(z(html));

        }).fail(function(xhr, textStatus, errorThrown){
            if (textStatus != 'abort') wmgui.notify('Connection to server is lost, please try to reload');
        });
        return false;
    });

    $('#navicon').click(function(){
        if ($(this).hasClass('opened')){
            $(this).removeClass('opened');
            $('#hamburger').addClass('closed');
            $('#overlay, #menu_content').hide();
        } else {
            $(this).addClass('opened');
            $('#hamburger').removeClass('closed');
            $('#overlay, #menu_content').show();
        }
    });

    $('#menu_content > ul > li > a').click(function(){
        $('#navicon').removeClass('opened');
        $('#hamburger').addClass('closed');
        $('#overlay, #menu_content').hide();
        return true;
    });

    $('#login_trigger').click(function(){
        if ($(this).data('busy')) return;
        $(this).data('busy', true);
        $.ajax({type: 'POST', url: wmgui.login_endpoint, data: {login: $('#login_email').val().trim(), pass: $('#login_password').val()}, beforeSend: show_preloader}).always(function(){
            $('#login_trigger').data('busy', false);
            hide_preloader();

        }).done(function(data){
            if (data.error) return wmgui.notify(data.error);
            if (!data.sid || !data.name || !data.acclogin) return wmgui.notify('Connection to server is lost, please try to reload');
            user_login(data.sid, data.name, data.acclogin, data.admin);
            window.location.hash = '#start';
            $('#navicon').trigger('click');
            $('#loginbox, #restorebox').hide();

        }).fail(function(xhr, textStatus, errorThrown){
            wmgui.notify("Login unsuccessful");
        });
    });

    $('#restore_trigger').click(function(){
        if ($(this).data('busy')) return;
        $(this).data('busy', true);
        $.ajax({type: 'POST', url: wmgui.restore_endpoint, data: {login: $('#restore_by_email').val().trim()}, beforeSend: show_preloader}).always(function(){
            $('#restore_trigger').data('busy', false);
            hide_preloader();

        }).done(function(data){
            if (data.error) return wmgui.notify(data.error);
            wmgui.notify('Please, check your inbox (and spam)');
            $('#navicon').trigger('click');
            $('#loginbox, #restorebox').hide();

        }).fail(function(xhr, textStatus, errorThrown){
            if (textStatus != 'abort') wmgui.notify('A network error occured. Please, try again');
        });
    });

    $('div.cross').click(function(){
        window.location.hash = '#start';
    });

    $('#logout_item').click(function(){
        $.ajax({type: 'POST', url: wmgui.logout_endpoint, data: {sid: wmgui.sid}}).done(function(data){}).fail(function(xhr, textStatus, errorThrown){});
        user_logout();
    });

    $(document).keydown(function(e){
        var key = window.event ? e.keyCode : e.which;
        if (key == 13) $('#search_trigger').trigger('click');
    });

    $(window).bind('hashchange', url_redraw_react);
}
