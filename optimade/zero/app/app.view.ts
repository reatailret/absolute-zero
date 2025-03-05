namespace $.$$ {
	export class $optimade_zero_app extends $.$optimade_zero_app {
		
		@$mol_mem
		focus_to_search(){

			if(this.$.$mol_mem_cached(()=>this.focus_to_search())){
				return true
			}
			if(!this.$.$mol_state_arg.dict()[this.param()]){
				this.$.$mol_state_arg.value(this.param(), 'search')
				//this.SearchField().bring()
			}
			return true
		}
		auto(){
			this.focus_to_search()
		}
		
	}
}
