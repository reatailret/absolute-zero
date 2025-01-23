/**
 * Mobile GUI for the chemistry DB
 * Version: 0.5.5ce
 */
"use strict";

wmgui.notify = function(msg){
    console.log(msg);
    alert(msg);
    close_vibox();
}

function switch_viewmode(mode){

    wmgui.viewmode = mode;

    if (mode == 2){
        $('#branding').hide();
        $('#content').show();
        window.scrollTo(0, 0);

        $('#summary, #results, #summary_caption, #results_caption').hide();

    } else {
        $('#content').hide();
        $('#branding').show();
        $('#search_field-selectized').focus();
    }
}

function request_analysis(query_obj){
    var given_search = {};
    $.extend(given_search, query_obj);
    try { wmgui.active_ajax.abort() } catch(e){}
    wmgui.active_ajax = $.ajax({type: 'GET', url: wmgui.rfn_endpoint, data: {q: JSON.stringify(given_search)}, beforeSend: show_preloader}).always(hide_preloader).done(function(data){
        if (data.error) return wmgui.notify(data.error);

        var was_facet = null,
            refine_html = '',
            classes_chk = [],
            max_count = 0;

        if (query_obj.classes){ // no whitespace in multiple classes
            classes_chk = given_search.classes.split(',').map(function(i){ return i.trim() });
            given_search.classes = classes_chk.join(',');
        }

        $.each(data.payload, function(i, found_obj){
            if (query_obj.formulae && found_obj.facet == 'elements') return true; // NB no sense to show elements in this context

            var link_text = found_obj.value,
                nested_skip = false,
                orepr = {};

            if (found_obj.count > max_count) max_count = found_obj.count;

            $.each(given_search, function(key, val){ // compile individual search link
                if (found_obj.facet == 'elements' && (key == 'elements' || key == 'formulae')) return true;
                else if (found_obj.facet == 'props' && key == 'props') return true;
                else if (orepr[key] && key == 'classes') val += ', ' + orepr[key];
                orepr[key] = val;
            });

            if (query_obj.classes && found_obj.facet == 'classes'){
                $.each(classes_chk, function(n, cls){
                    if (cls == found_obj.value){ nested_skip = true; return false; }
                });
            }
            if (nested_skip) return true;

            if (found_obj.facet != was_facet){
                if (was_facet) refine_html += '<li class="fct_' + was_facet + ' extd_refine"><a class="extd_refine" rel="' + was_facet + '" href="#">Show more</a></li>';
                refine_html += '<li class="new_rfn_facet fct_' + found_obj.facet + '">' + wmgui.facet_names[found_obj.facet] + '</li>';
                was_facet = found_obj.facet;
            }
            if (found_obj.facet == 'props'){
                found_obj.value = found_obj.value.replace(/\(|\)/g, "").replace(/\/[\w\-]*/g, ""); // FIXME!
            }

            // FIXME!!! lost classes in refinement: see #inquiry/classes=alkaline&years=2010-2018
            orepr[found_obj.facet] = found_obj.value;
            if (orepr['elements']) orepr['elements'] = orepr['elements'].replaceAll(', ', '-');

            refine_html += '<li class="fct_' + found_obj.facet + '"><a href="#inquiry/' + $.param(orepr) + '">' + link_text + '</a></li>';
        });

        if (refine_html.length){
            refine_html += '<li class="fct_' + was_facet + ' extd_refine"><a class="extd_refine" rel="' + was_facet + '" href="#">Show more</a></li>';
            if (max_count > 50){
                $('#summary > ul').empty().append(z(refine_html)).parent().show();
                $('#summary_caption').show();
            }
        }

        request_data(query_obj);

    }).fail(function(xhr, textStatus, errorThrown){
        if (textStatus != 'abort') wmgui.notify('Connection to server is lost, please try to reload');
    });
}

function request_data(query_obj){
    wmgui.active_ajax = $.ajax({type: 'GET', url: wmgui.srch_endpoint, data: {q: JSON.stringify(query_obj)}, beforeSend: show_preloader}).always(hide_preloader).done(function(data){
        if (data.error)
            return wmgui.notify(data.error);
        if (!data.out.length)
            return wmgui.notify('Nothing found!');
        if (data.notice)
            wmgui.notify(data.notice);
        if (data.fuzzy_notice)
            wmgui.notify(data.fuzzy_notice);

        var cls_map = {7: ' ml_data', 8: ' ab_data', 9: ' ab_data', 10: ' ab_data'}, // NB space
            result_cells = '';

        data.out.sort(function(a, b){
            var x = a[2].toLowerCase(),
                y = b[2].toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });

        $.each(data.out, function(k, row){
            row[7] = parseInt(row[7]);
            var dtype = row[0].substr(0, 1),
                content,
                dlinks = '<i>Log in to access</i>',
                biblio_html = (row[7] == 999999) ? '' :
                '<br />[' + row[5] + '&rsquo;' + row[6].toString().substr(2, 2) + ']'; // special *ref_id*, only handled in GUI

            if (wmgui.sid && biblio_html) dlinks = '<a href="' + wmgui.refs_endpoint + '?ref_id=' + row[7] + '&sid=' + wmgui.sid + '&fmt=bib">Ref.</a><a href="' + wmgui.dd_addr_tpl + '/' + dtype.toLowerCase() + '?q=' + row[0] + '&fmt=pdf&sid=' + wmgui.sid + '">PDF</a>';

            if (dtype == 'P'){
                content = '<div>' + row[2] + '</div>';

            } else if (dtype == 'C'){
                content = '<img alt="' + row[0] + '" src="' + wmgui.cdn_host + '/' + ((dtype=='C') ? 'pd_thumbs' : 'rd_thumbs') + '/' + row[0].split('-')[0] + '.png" />'; // NB handled remotely
                if (wmgui.sid) dlinks = '<a href="' + wmgui.dd_addr_tpl + '/c?q=' + row[0] + '&fmt=png&sid=' + wmgui.sid + '">PNG</a>';

            } else {
                content = '<img alt="' + row[0] + '" src="' + wmgui.cdn_host + '/' + ((dtype=='C') ? 'pd_thumbs' : 'rd_thumbs') + '/' + row[0].split('-')[0] + '.png" />'; // NB handled remotely
                dlinks = '<a href="' + wmgui.dd_addr_tpl + '/s?q=' + row[0] + '&fmt=png">PNG</a><a href="' + wmgui.dd_addr_tpl + '/' + dtype.toLowerCase() + '?q=' + row[0] + '&fmt=gif">anim</a>';
            }

            result_cells += '<div class="gallery_item' + (cls_map[row[3]] || '') + (wmgui.sid ? '' : (row[4] ? ' opened' : '')) + '" id="e__' + row[0] + '" data-type="' + dtype + '"> <div class="gallery_img" data-id="' + row[0] + '">' + content + '</div> <div class="gallery_label" data-id="' + row[0] + '">' + row[1] + biblio_html + '</div> <div class="gallery_links"> ' + dlinks + ' </div> </div>';
        });

        if (result_cells.length){
            $('#results').empty().append(result_cells).show();
            $('#results_caption').show();
        }
    }).fail(function(xhr, textStatus, errorThrown){
        if (textStatus != 'abort') wmgui.notify('Connection to server is lost, please try to reload');
    });
}

function close_vibox(){
    var iframe = $('#iframe');
    if (iframe.length){
        $('#iframe').remove();
        $('#overlay').hide();
        $('#hamburger').show();
        return true;
    }
    return false;
}

function rotate_example(){
    var example = WMCORE.generate_example();
    $('#legend').html('<i>e.g.</i> <a href="#" data-facet-a="' + example['facets'][0] + '" data-facet-b="' + example['facets'][1] + '" data-term-a="' + example['terms'][0] + '" data-term-b="' + example['terms'][1] + '">' + example['text'].replace(/\d/g, "&#x208$&;") + '</a>');
}

function rotate_motto(){
    $('#motto > span').animate({ opacity: 'hide' }, 2500, function(){
        $('#motto > span').html(wmgui.mob_motto[ Math.floor(Math.random() * wmgui.mob_motto.length) ]).animate({ opacity: 'show' }, 1500, function(){
            setTimeout(rotate_motto, 2500);
        });
    });
}

function user_login(sid, name, acclogin, admin){
    $('#user_status > span').text(name);
    $('#login_item').hide();
    $('#logout_item').show();
    wmgui.sid = sid;
    window.localStorage.setItem('wm', JSON.stringify({sid: sid, name: name, acclogin: acclogin, admin: admin}));
}

function user_logout(){
    $('#user_status > span').text('Hi, guest');
    $('#logout_item').hide();
    $('#login_item').show();
    wmgui.sid = null;
    window.localStorage.removeItem('wm');
}

function satisfy_requirements(){

    var locals = JSON.parse(window.localStorage.getItem('wm') || '{}');
    if (locals.sid && locals.name && locals.acclogin){
        user_login(locals.sid, locals.name, locals.acclogin, locals.admin);
    }

    WMCORE = WMCORE();

    rotate_example();
    setInterval(rotate_example, 2250);
    $('#motto > span').html(wmgui.mob_motto[ Math.floor(Math.random() * wmgui.mob_motto.length) ]);
    setTimeout(rotate_motto, 2500);

    var control = $('#search_field').selectize({
        plugins: ['remove_button', 'preserve_on_blur'],
        dropdownParent: '#suggestions',
        valueField: 'id',
        labelField: 'label',
        searchField: 'label',
        create: false,
        maxItems: 5,
        closeAfterSelect: true,
        diacritics: false,
        options: [],
        onInitialize: function(){
            $('#searchbox > div.selectize-control').append('<a href="#" id="search_trigger" title="Start search now">&rArr;</a>');
            $('#search_field-selectized').focus();
        },
        load: function(query, callback){
            this.clearOptions();
            $('#selectize_msg').hide();
            if (!query.length) return callback();
            $.ajax({
                url: wmgui.api_host + '/search/selectize?q=' + encodeURIComponent(query),
                type: 'GET',
                error: callback,
                success: function(res){
                    //console.log(res.length);
                    $('#suggestions').show();
                    if (!res.length){
                        $('#selectize_msg').show();
                        $('#search_trigger').hide();
                        return;
                    }
                    callback(res);
                }
            });
        },
        score: function(){ return function(){ return 1 } }, // no client scoring
        onFocus: function(){
            if ($.isEmptyObject(this.renderCache)) return;
            $('#suggestions').show();
        },
        onBlur: function(){
            $('#suggestions').hide();
        },
        render: {
            option: function(item, escape){
                return '<div class="fct_' + item.facet + '">' + item.label + '</div>';
            },
            item: function(item, escape){
                return '<div class="fct_' + item.facet + '" data-facet="' + item.facet + '" data-term="' + item.label + '">' + item.label + '</div>';
            }
        },
        onItemAdd: function(value, item){
            $('#search_trigger').show();
        },
        onItemRemove: function(value){
            if ($.isEmptyObject(wmgui.selectize.read())) $('#search_trigger').hide();
        }
    });
    wmgui.selectize = control[0].selectize;

    wmgui.selectize.read = function(){
        var result = {};
        $('div.selectize-input.items').children().each(function(){
            if (this.tagName == 'DIV'){
                var facet = this.getAttribute('data-facet');

                if (result[facet] && facet == 'elements')
                    result[facet] += '-' + this.getAttribute('data-term');
                else if (result[facet] && (facet == 'classes' || facet == 'aetypes'))
                    result[facet] += ', ' + this.getAttribute('data-term');
                else if (facet == 'formulae')
                    result[facet] = this.getAttribute('data-term').replaceAll('<sub>', '').replaceAll('</sub>', '');
                else
                    result[facet] = this.getAttribute('data-term');
            }
        });
        return result;
    }

    wmgui.selectize.write = function(search_obj){
        var given_search = {};
        $.extend(given_search, search_obj);

        ['formulae', 'props', 'elements', 'classes', 'lattices', 'aetypes'].forEach(function(facet){
            if (!given_search[facet])
                return;

            else if (facet == 'elements' && given_search[facet].indexOf('-') > 0){
                given_search[facet].split('-').forEach(function(part){
                    wmgui.selectize.display(facet, part);
                });
            } else if ((facet == 'classes' || facet == 'aetypes') && given_search[facet].indexOf(',') > 0){
                given_search[facet].split(',').forEach(function(part){
                    wmgui.selectize.display(facet, part);
                });
            } else if (facet == 'formulae'){
                given_search[facet] = WMCORE.to_formula(given_search[facet]);
                wmgui.selectize.display(facet, given_search[facet]);

            } else wmgui.selectize.display(facet, given_search[facet]);
        });
        wmgui.selectize.clearOptions();
    }

    wmgui.selectize.display = function(facet, term){
        var random_id = Math.floor((Math.random() * 1000));
        wmgui.selectize.addOption({facet: facet, label: term, id: random_id});
        wmgui.selectize.addItem(random_id);
    }

    window.location.hash ? url_redraw_react() : window.location.replace('#start');
}

// now, fire in the holl!

satisfy_requirements();

register_events();
