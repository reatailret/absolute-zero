namespace $.$$ {
	export class $optimade_zero_resultitem extends $.$optimade_zero_resultitem {
		
		@$mol_mem
		data(next?:any)
		{
			return next ?? []
		}
		
		@$mol_mem
		title(next?:string)
		{
			return next ?? (this.data().length ? this.data()[ 2 ] : '')
		}
		@$mol_mem
		formula(next?:string)
		{
			return next ?? (this.data().length ? this.data()[ 1 ] : '')
		}

		@$mol_mem
		contentblock(){
			
			if(!this.data().length) return []
			const row = this.data()
			row[7] = parseInt(row[7]);
			const dtype = row[0].substr(0, 1)
			let content =  [this.image()]
			let dlinks = this.has_access() ? [] : [this.login_link()]
			
			if(this.biblio_html() && this.has_access()){
				dlinks = [this.ref_link(), this.pdf_link()]
			}
			
			if(dtype === 'P'){
				content = []
			}
			else if(dtype === 'C'){
				
				if(this.has_access()){
					dlinks = [this.png_link()]
				}
			}
			else{
				dlinks = [this.png_link(),this.anim_link()]
			}
			return [...content,this.text(), ...dlinks]
		}
		@$mol_mem
		calculated_content(){
			return [...this.card_content(), ...this.contentblock()]
		}
		@$mol_mem
		biblio_html(){
			const row = this.data()
			const biblio_html = (row[7] == 999999) ? '' :'[' + row[5] + '`' + row[6].toString().substr(2, 2) + ']'
			return biblio_html
		}
		@$mol_mem
		textcontent(){
			return this.biblio_html()
		}
		@$mol_mem
		dtype(){
			return this.data()[ 0 ].substr(0, 1)
		}
		@$mol_mem
		image_url(){
			return this.cdn_host() + '/' + ((this.dtype() ==='C') ? 'pd_thumbs' : 'rd_thumbs') + '/' + this.data()[ 0 ].split('-')[0] + '.png' 
		}
		@$mol_mem
		image_alt(){
			return this.data()[ 0 ]
		}
		@$mol_mem
		png_link_url(){
			return (this.dtype() ==='C') ? 
			this.dd_addr_tpl() + '/c?q=' + this.data()[ 0 ] + '&fmt=png&sid=' + this.user_sid():
			this.dd_addr_tpl() + '/s?q=' + this.data()[ 0 ] + '&fmt=png'
		}
		@$mol_mem
		anim_link_url(){
			return this.dd_addr_tpl() + '/' + this.dtype().toLowerCase() + '?q=' + this.data()[ 0 ] + '&fmt=gif'
		}
		@$mol_mem
		pdf_link_url(){
			return this.dd_addr_tpl() + '/' + this.dtype().toLowerCase() + '?q=' + this.data()[ 0 ] + '&fmt=pdf&sid=' + this.user_sid()
		}
		@$mol_mem
		ref_link_url(){
			return this.refs_endpoint() + '?ref_id=' + this.data()[ 7 ] + '&sid=' + this.user_sid() + '&fmt=bib'
		}
		
	}
}
