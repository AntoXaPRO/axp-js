import { object } from 'yup'

export default class _BaseValidEntity {
    constructor(obj = {}, schema = {}){
        this._errors = {}
        this._schema = object().shape(schema)
        this.obj = this.convertByFields(obj)
    }

    /**
     * Возвращает массив ошибок.
     */
    get errors () {
        let arr = []
        for(let key in this._errors){
            if(this._errors[key]){
                arr.push({ code: key, text: this._errors[key] })
            }
        }
        return arr
    }

    /**
     * ПРиватный метод - добавляет ошибки в поле this._errors
     * @param { Error } ex - Обект ошибки. 
     */
    _setErrors(ex){
        ex.inner.forEach(e => this._errors[e.path] = e.message)
        return { message: ex.message, errors: this.errors }
    }

    /**
     * Валидация по схеме - возвращает true или false
     */
    isValid(){
        this._errors = {}
        try{
            const obj = this._schema.validateSync(this.obj, { abortEarly: false })
            this.obj = this._schema.cast(obj)
            return true
        }catch(ex){
            this._setErrors(ex)
            return false
        }
    }

    /**
     * Валидация по схеме - возвращает промис.
     */
    validate(){
        this._errors = {}
        return new Promise((resolve, reject) => {
            this._schema.validate(this.obj, { abortEarly: false }).then(obj => {
                this.obj = this._schema.cast(obj)
                resolve(this.obj)
            }).catch(ex => {
                reject(this._setErrors(ex))
            })
        })
    }

    /**
     * Возвращает объект сформированный из полей схемы.
     * @param { Object } obj - Объект для конвертации. 
     */
    convertByFields(obj = this.obj){
        let result = {}
        for(let key in this._schema.fields){
            result[key] = obj[key]
        }
        return result
    }

    /**
     * Метод вызываемый перед сохранением в БД и возврощает объект который в итоге должен попасть в БД. 
     * Предназначен в основном для переопределения, чтобы изменить объект перед сохранением.
     * @param {*} obj 
     */
    convertPreSave(obj = this.obj){
        return this.convertByFields(obj)
    }
}