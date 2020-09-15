export default class Email {
    constructor(str, opts = {}){
        this._regexp = opts.regexp || /^(([^<>()\[\]\\.,:\s@"]+(\.[^<>()\[\]\\.,:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        this.value = this.toString(str)
    }

    isValid(){
        if(this._regexp.test(this.value)){
            return true
        }
        return false
    }

    toString(value = this.value){
        return value.trim()
    }
}