import { object } from 'yup'

export default class _BaseValidEntity {
    constructor(obj = {}, schema = {}){
        this._schema = object().shape(schema)
        this._errors = {}
        this.obj = obj
    }

    get errors () {
        let arr = []
        for(let key in this._errors){
            if(this._errors[key]){
                arr.push({ code: key, text: this._errors[key] })
            }
        }
        return arr
    }

    _setErrors(ex){
        ex.inner.forEach(e => this._errors[e.path] = e.message)
        return { message: ex.message, errors: this.errors }
    }

    isValid(){
        this._errors = {}
        try{
            const obj = this._schema.validateSync(this.obj, { abortEarly: false })
            this.obj = {
                ...this.obj,
                ...this._schema.cast(obj)
            }
            return true
        }catch(ex){
            this._setErrors(ex)
            return false
        }
    }

    validate(){
        this._errors = {}
        return new Promise((resolve, reject) => {
            this._schema.validate(this.obj, { abortEarly: false }).then(obj => {
                this.obj = { ...this.obj, ...this._schema.cast(obj) }
                resolve(this.obj)
            }).catch(ex => {
                reject(this._setErrors(ex))
            })
        })
    }
}