namespace $.$$
{
	const { vary } = $mol_style_func

	$mol_style_define( $optimade_zero_search, {


		FacetSelectorLabeler: {
			Content: {
				flex: {
					direction: 'column',
				}


			}

		},
		SearchPage: {
			flex: {
				basis: '400px',
			},
			Body_content:{
				padding: {
					left: 0,
					right: 0,
				}
			}
		},
		ResultsPage: {
			flex: {
				grow: 3,
			},
			Body_content:{
				padding: {
					left: 0,
					right: 0,
				}
			}
		},
		SearchInputRow: {
			width: '100%',
		},
		RefinementLabel: {
			Content: {
				flex: {
					direction: 'column',
				}
			}
		},
		SearchLabel: {
			Content: {
				flex: {
					direction: 'column',
				}
			}
		},
		FoundStr: {
			font: {
				size: '0.8rem',
				weight: 500,
			}
		},
		SearchSubRow: {
			margin: 0,
			padding: 0,
		},
		ShowResultsLink: {
			font: {
				size: '0.8rem',
				weight: 500,

			},
			padding: 0
		},
		Results: {
			display: 'grid',
			gridTemplateColumns: 'repeat( auto-fit, minmax( 20rem, 1fr ) );',
		},




	} )
}
