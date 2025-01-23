/**
 * Mobile GUI for the chemistry DB
 * Version: 0.5.5ce
 */
"use strict";

var wmgui = {};
wmgui.active_ajax = null;
wmgui.facets = ['formulae', 'props', 'elements', 'classes', 'lattices', 'sgs', 'protos', 'authors', 'years', 'codens', 'doi', 'aeatoms', 'aetypes', 'geos', 'orgs'];

wmgui.facet_names = {
    props: 'Physical properties',
    elements: 'Chemical elements',
    classes: 'Materials classes',
    lattices: 'Crystal systems',
    formulae: 'Chemical formulae',
    protos: 'Prototypes',
    sgs: 'Space groups',
    numeric: 'Numerical search', // NB not a real facet!
    authors: 'Authors',
    years: 'Years',
    codens: 'Journal codes',
    doi: 'DOI',
    aeatoms: 'Polyhedron atoms',
    aetypes: 'Polyhedral types',
    geos: 'Geography',
    orgs: 'Organization'
};
wmgui.search = {};
wmgui.sid = null;

wmgui.mob_motto = [
    'about 0.5M scientific publications and >30M data points for AI training',
    'machine-readable materials data from the world\'s peer-reviewed literature',
    'the world\'s biggest high-quality curated database of materials',
    'the largest and most comprehensive inorganic materials dataset',
    '~0.5M peer-reviewed materials publications dated from 1891 until now'
];

wmgui.cdn_host = 'https://mpds.io';
wmgui.api_host = 'https://api.mpds.io/v0';

wmgui.login_endpoint =    wmgui.api_host + '/users/login';
wmgui.logout_endpoint =   wmgui.api_host + '/users/logout';
wmgui.restore_endpoint =  wmgui.api_host + '/users/lost_password';
wmgui.access_endpoint =   wmgui.api_host + '/users/access';
wmgui.srch_endpoint =     wmgui.api_host + '/search/facet';
wmgui.rfn_endpoint =      wmgui.api_host + '/search/refinement';
wmgui.phph_endpoint =     wmgui.api_host + '/search/phase_phid';
wmgui.refs_endpoint =     wmgui.api_host + '/download/bib';

wmgui.dd_addr_tpl =       wmgui.api_host + '/download';
