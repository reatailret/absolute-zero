namespace $
{



	export class $optimade_zero_api extends $mol_object2
	{


		query_params = {

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
		} as Record<string, string>
		@$mol_mem
		NLP()
		{
			//@ts-ignore
			const cl = require( 'optimade-mpds-nlp' ) as typeof import( 'optimade-mpds-nlp' )
			return new cl()
		}
		@$mol_mem_key
		string_to_facets( search: string )
		{

			return this.NLP().guess( search )
		}
		@$mol_mem_key
		facet_array_to_dict( val: $optimade_zero_api_Facet[] )
		{

			const result = {} as Record<string, string[]>
			const result2 = {} as Record<string, string>
			for( const facet of val )
			{
				if( !result[ facet.facet ] ) result[ facet.facet ] = []
				result[ facet.facet ].push( facet.label )
			}
			for( const key in result )
			{
				if( result[ key! ] && result[ key! ].length )
				{
					result2[ key ] = result[ key! ].join( ',' )
				}
			}
			return result2
		}
		@$mol_mem_key
		facet_dict_to_array( val: Record<string, string> )
		{
			const res = [] as $optimade_zero_api_Facet[]

			Object.keys( val ).map( ( el ) =>
			{
				if( val[ el ] )
				{
					const ar = val[ el ].split( ',' )
					for( const element of ar )
					{
						res.push( { facet: el, label: element.trim() } )
					}

				}
			} )
			return res
		}

		
		uri_to_facets()
		{
			const res = [] as $optimade_zero_api_Facet[]
			const dict =$mol_state_arg.dict()

			Object.keys( this.query_params ).map( ( el ) =>
			{
				if( dict[ el ] )
				{
					const ar = dict[ el ].split( ',' )
					for( const element of ar )
					{
						res.push( { facet: el, label: element.replaceAll( '-', ', ' ), id: '' } )
					}

				}
			} )
			return res
		}
		@$mol_action
		selectize( search?: string ): $optimade_zero_api_Facet[]
		{

			if( search )
			{
				return $mol_fetch.json( this.selectize_endpoint() + '?' + new URLSearchParams( {
					q: search
				} ).toString() ) as unknown as $optimade_zero_api_Facet[]
			}
			return []

		}

		facet_dict_to_query(dict:object){
			return new URLSearchParams( { q: JSON.stringify( dict ) } ).toString() 
		}
		@$mol_action
		refinement( search?: Record<string, string> | null ): $optimade_zero_api_FacetSuggestResponse
		{

			if( search && Object.keys( search ).length )
			{
				return $mol_fetch.json( this.rfn_endpoint() + '?' + this.facet_dict_to_query(search)) as unknown as $optimade_zero_api_FacetSuggestResponse
			}
			return {
				error: '',
				payload: [],
				total_count: 0,
				use_visavis_type: ''
			}

		}

		@$mol_action
		results( search?: Record<string, string> | null ): $optimade_zero_api_SearchResponse
		{

			if( search && Object.keys( search ).length )
			{
				const response = $mol_fetch.json( this.srch_endpoint() + '?' + this.facet_dict_to_query(search) ) as unknown as $optimade_zero_api_SearchResponse
				if( response.out )
				{
					response.out = this.transform_results( response.out )
				}
				return response
			}
			return {
				error: '',
				fuzzy_notice: '',
				out: [],
				estimated_count: 0
			}

		}
		transform_results( results: $optimade_zero_api_SearchResponse[ 'out' ] )
		{
			let out = results.sort( ( a, b ) =>
			{
				var x = a[ 2 ].toLowerCase(),
					y = b[ 2 ].toLowerCase()
				return x < y ? -1 : x > y ? 1 : 0
			} )
			return out

		}
		@$mol_mem
		user_sid(next?: string):string
		{
			if(next !== undefined) {
				$mol_state_session.value('sid', next)
			}
			return $mol_state_session.value('sid')??''
		}
		@$mol_action
		login( login: string, pass: string )
		{


			const resp = $mol_fetch.json( this.login_endpoint(), {
				method: 'POST',
				body: JSON.stringify( { login, pass } ),
				headers: {
					'Content-Type': 'application/json'
				}
			} ) as unknown as { sid: string }
			
			if(resp.sid) {
				this.user_sid(resp.sid)
			}
			return resp


		}
		@$mol_action
		logout() {
			this.user_sid('')
		}

		cdn_host()
		{
			return 'https://mpds.io'
		}
		api_host()
		{
			return 'https://api.mpds.io/v0'
		}

		login_endpoint()
		{
			return this.api_host() + '/users/login'
		}
		logout_endpoint()
		{
			return this.api_host() + '/users/logout'
		}
		restore_endpoint()
		{
			return this.api_host() + '/users/lost_password'
		}
		access_endpoint()
		{
			return this.api_host() + '/users/access'
		}
		srch_endpoint()
		{
			return this.api_host() + '/search/facet'
		}
		selectize_endpoint()
		{
			return this.api_host() + '/search/selectize'
		}
		rfn_endpoint()
		{
			return this.api_host() + '/search/refinement'
		}
		phph_endpoint()
		{
			return this.api_host() + '/search/phase_phid'
		}
		refs_endpoint()
		{
			return this.api_host() + '/download/bib'
		}
		dd_addr_tpl()
		{
			return this.api_host() + '/download'
		}
	}

	export type $optimade_zero_api_Facet = {
		facet: string
		label: string
		id?: string
	}

	export type $optimade_zero_api_FacetSuggestResponse = {
		error: null | string
		payload: {
			facet: string
			value: string
			count: number
		}[]
		total_count: number
		use_visavis_type: string
	}
	export type $optimade_zero_api_SearchResponse = {
		error: null | string
		fuzzy_notice: null | string
		out: [
			id: string,
			formula: string,
			structure: string,
			count: number,
			unknown: boolean,
			code: string,
			year: number,
			entry_id: number
		][]
		estimated_count: number
	}
}
