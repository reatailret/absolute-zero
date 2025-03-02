namespace $.$$
{
	export class $optimade_zero_search extends $.$optimade_zero_search
	{

		auto(){
			
			this.preselect_search_facets(this.api().uri_to_facets())
		}
		@$mol_mem
		visible_pages()
		{
			return $mol_state_arg.dict()[ 'results' ] ? [ this.SearchPage(), this.ResultsPage() ] : [ this.SearchPage() ]
		}
		@$mol_action
		suggest_select( id: string, event?: MouseEvent )
		{
			const facets = this.selectizes().filter( el => el.label === id )
			this.preselect_search_facets( [ ...this.preselect_search_facets(), ...facets ] )
			this.Words().suggests_showed( false )

			this.word( '' )

		}
		@$mol_mem
		suggests()
		{
			return this.selectizes().filter( el => !this.preselect_search_facets().some( el2 => el2.id === el.id ) ).map( el => el.label )
		}
		@$mol_mem
		selectizes()
		{
			this.reload_search()
			this.$.$mol_wait_timeout( 200 )

			return this.api().selectize( this.word() ).map( el => ({...el, label:el.label.replace(/<\/?(?:sup|sub)>/g, '')}) )
		}

		@$mol_action
		search_click()
		{

			if( !this.word() ) return

			const finded = this.api().string_to_facets( this.word() )
			delete finded[ 'ignored' ]
			if( Object.keys( finded ).length )
			{
				this.preselect_search_facets( this.api().facet_dict_to_array( finded ) )
			}
		}
		@$mol_mem
		reload_search( next?: number )
		{
			return next ?? Date.now()
		}
		@$mol_action
		clear_search()
		{
			this.preselect_search_facets( [] )
		}
		@$mol_action
		reset()
		{
			this.reload_search( Date.now() )
		}

		@$mol_mem
		combined_facets()
		{
			const dict = this.api().facet_array_to_dict( this.preselect_search_facets() )
			for( const key in dict )
			{
				dict[ key ] = dict[ key ].replaceAll( ', ', '-' )
			}
			const old = $mol_mem_cached( () => this.combined_facets() )
			$mol_state_arg.dict()
			if( old )
			{
				console.log("clear args")
				for( const key in old )
				{
					$mol_state_arg.value( key, null )
				}
			}
			for( const key in dict )
			{
				console.log("set args",key,dict[key])
				$mol_state_arg.value( key, dict[ key ] )
			}
			return dict
		}
		@$mol_mem
		refinements()
		{
			this.reload_search()
			this.$.$mol_wait_timeout( 200 )

			const resp = this.api().refinement( this.combined_facets() )

			return resp

		}

		@$mol_mem_key
		override refinement_options( id: string )
		{
			const opts = {} as Record<string, string>
			this.facets_grouped()[ id ]?.map( ( el, index ) => opts[ `${ id }_${ el }` ] = el.charAt( 0 ).toUpperCase() + el.slice( 1 ) )
			return opts
		}

		@$mol_mem_key
		override facet_selector_label( el: string )
		{
			return this.api().query_params[ el ]
		}

		@$mol_mem
		facets_grouped()
		{
			const resp = this.refinements()
			if(resp.error)
			{
				throw new Error( resp.error )
			}
			if( Object.keys( this.preselect_classes_options() ).length )
			{
				const groups = {} as Record<string, string[]>
				resp.payload.map( el => groups[ el.facet ] ? groups[ el.facet ].push( el.value ) : groups[ el.facet ] = [ el.value ] )


				return groups

			}
			else
			{
				return {}
			}

		}

		@$mol_mem
		override facet_blocks()
		{

			return Object.keys( this.facets_grouped() ).map( ( val ) =>
			{
				return this.FacetSelectorLabeler( val )
			} )
		}
		@$mol_mem
		found_count()
		{
			return this.results().length
		}
		@$mol_mem_key
		override preselect_classes_checked( id: string, next?: any )
		{

			if( next === false )
			{
				const facetIndex = this.preselect_search_facets().findIndex( el => `${ el.facet }_${ el.label }` === id )
				const spl = [ ...this.preselect_search_facets() ]
				spl.splice( facetIndex, 1 )
				this.preselect_search_facets( spl )
				return next
			}
			return true
		}
		@$mol_mem_key
		override facets_checked( id: string, next?: any )
		{

			if( next === true )
			{
				const [ key, val ] = id.split( '_' )
				const facet = { facet: key, label: val, id: '' }
				const spl = [ ...this.preselect_search_facets(), facet ]
				this.preselect_search_facets( spl )

			}
			return this.preselect_classes_options()[ id ] ? this.preselect_classes_checked( id, next ) : false
		}
		@$mol_mem
		result_items()
		{

			return this.results().map( ( el, index ) => this.ResultItem( index ) )
		}
		@$mol_mem_key
		result_item( index?: number )
		{
			return this.results()[ index! ] ?? {}
		}
		@$mol_mem
		results()
		{
			this.reload_search()
			this.$.$mol_wait_timeout( 200 )
			const response = this.api().results( this.combined_facets() )
			return response.out ?? []


		}

		@$mol_mem
		preselect_search_facets( next?: $optimade_zero_api_Facet[] )
		{
			console.log("preselect_search_facets",next)
			return next ?? []
		}
		@$mol_mem
		override preselect_classes_options()
		{

			const result = {
			} as Record<string, string>

			this.preselect_search_facets().map( el =>
			{
				const label = el.label
				result[ `${ el.facet }_${ label }` ] = label
			} )
			return result
		}
	}
}
