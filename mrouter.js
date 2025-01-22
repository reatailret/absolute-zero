/**
 * Mobile GUI for the chemistry DB
 * Version: 0.5.5ce
 */
"use strict";

function url_redraw_react(){
    var anchors = window.location.hash.substr(1).split('/');

    if (!anchors.length) return;
    $('#loginbox, #restorebox').hide();
    try { wmgui.active_ajax.abort() } catch(e){}

    if (window['url__' + anchors[0]]) window['url__' + anchors[0]](anchors.slice(1).join('/'));
    else window.location.hash = '#start';
}

function url__start(arg){
    switch_viewmode(1);
}

function url__search(arg){
    window.location.replace('#start');
}

function url__phase_id(arg){
    switch_viewmode(2);
    var phid = parseInt(arg);
    $('#input > ul').empty().append('<li class="fct_ignored"><span>Distinct phase</span><br />#' + phid + '</li>');
    request_data({'phid': phid});
}

function url__inquiry(arg){
    var inquiry = arg.split("&").map( function(n){ return n = n.split("="), this[n[0]] = n[1], this }.bind({}) )[0];

    wmgui.facets.forEach(function(item){
        if (inquiry[item]) inquiry[item] = unescape(inquiry[item].replaceAll('\\+', ' '));
    });

    wmgui.search = inquiry;

    switch_viewmode(2);

    $('#input > ul').empty().append(
        z(WMCORE.get_interpretation(inquiry, wmgui.facet_names))
    );

    $('#search_field-selectized').val('');
    wmgui.selectize.clear();
    wmgui.selectize.write(inquiry);

    request_analysis(inquiry);
}

function url__modal(arg){
    if (arg == "login"){
        if (wmgui.sid){
            $('#navicon').trigger('click');

        } else {
            if ($("#restore_by_email").val()) $("#login_email").val($("#restore_by_email").val());
            else $("#login_email").val('');
            $("#login_password").val('');
            $('#restorebox').hide();
            $('#loginbox').show();
        }

        // for OAuth linking redirect only
        var u_email = window.localStorage.getItem('wm_u_email') || false;
        if (u_email){
            $("#login_email").val(u_email);
            window.localStorage.removeItem('wm_u_email');
        }

    } else if (arg == "restore"){
        if (wmgui.sid){
            $('#navicon').trigger('click');

        } else {
            if ($("#login_email").val()) $("#restore_by_email").val($("#login_email").val());
            else $("#restore_by_email").val('');
            $('#loginbox').hide();
            $('#restorebox').show();
        }
    }
}

function url__access(arg){
    $.ajax({type: 'POST', url: wmgui.access_endpoint, data: {a: arg}}).done(function(data){
        window.location.replace('#start');
        if (data.error){
            return wmgui.notify(data.error);
        }
        if (!data.sid || !data.name || !data.acclogin){
            return wmgui.notify('Connection to server is lost, please try to reload');
        }
        user_login(data.sid, data.name, data.acclogin, data.admin);
        $('#navicon').trigger('click');
        $('#loginbox, #restorebox').hide();

    }).fail(function(xhr, textStatus, errorThrown){
        return wmgui.notify('A network error occured. Please, try again');
    });
}

function url__entry(arg){
    switch_viewmode(2);
    $('#input > ul').empty().append('<li class="fct_ignored"><span>Entry</span><br />' + arg + '</li>');
    request_data({'entry': arg});
}

function url__junction(arg){
    wmgui.notify('Please retry to log in');
    window.location.replace('#start');
}
