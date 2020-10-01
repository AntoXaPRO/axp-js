import { DataResultCollectionEntity, DataResultEntity } from '../entities'

export default class _BaseMongooseService {
    constructor(model, { fields, populate, sort }, formModel){
        this._model = model,
        this._options = {
            fields: fields || [],
            populate: populate || [],
            sort: sort || { dateCreate: 'desc' }
        }
        this._formModel = formModel
    }

    _returnData(query, callback){
        if(callback){
            const dataResult = new DataResultEntity()
            query.then(doc => {
                if(doc){
                    dataResult.data = doc
                }else{
                    dataResult.status = 404
                    dataResult.message = 'Not Found'
                    dataResult.errors.push({ code: 'not_found', text: 'The resource is not found' })
                }
            }).catch(ex => {
                dataResult.status = 500
                dataResult.message = 'Server Error'
                dataResult.errors.push({ code: 'server', text: ex.message })
            }).finally(() => {
                callback(dataResult)
            })
        }else{
            return query
        }
    }

    /**
     * Создание/Редактирование сущности.
     * @param { Object } obj - Объект сущности.
     * @param { Function } callback - Функция обратного вызова (аргумент функции DataResultEntity)
     */
    createOrUpdate (obj, callback){

        let validErrors = []
        const newDate = new Date()
        obj.dateCreate = obj.dateCreate ? obj.dateCreate : newDate
        obj.dateUpdate = newDate

        // Валидация данных.
        if(this._formModel){
            try{
                const model = new this._formModel(obj)
                if(model.isValid()){
                    obj = model.convertPreSave()
                }else{
                    validErrors = model.errors
                }
            }catch(ex){
                validErrors = [{ code: 'valid', text: ex.message }]
            }
        }

        // Промис.
        const promise = new Promise((resolve, reject) => {
            if(validErrors && validErrors.length > 0){
                reject(validErrors)
            }else{
                this._model.findByIdAndUpdate(obj._id, obj, { new: true, upsert: true, runValidators: true })
                .then(doc => resolve(doc))
                .catch(ex => reject([{ code: 'server_db', text: ex.message }]))
            }
        })

        // Возвращаем данные.
        if(callback){
            const dataResult = new DataResultEntity()
            if(validErrors && validErrors.length > 0){
                dataResult.status = 401
                dataResult.message = 'Valid error'
                dataResult.errors = validErrors
                callback(dataResult)
            }else{
                promise.then(doc => {
                    dataResult.status = obj._id ? 201 : 200
                    dataResult.message = 'The data was successfully stored.'
                    dataResult.data = doc
                }).catch(ex => {
                    dataResult.status = 500
                    dataResult.message = 'Server Error'
                    dataResult.errors = ex
                }).finally(() => {
                    callback(dataResult)
                })
            }
        }else{
            return promise
        }
    }

    /**
     * Возвращает коллекцию.
     * @param { Object } filter - Объект фильтра для выборки из БД.
     * @param { Object } options - Допю настройка для выборки (select, populate, sort)
     * @param { Function } callback - Функция обратного вызова (аргумент функции DataResultCollectionEntity)
     */
    find (filter = {}, options = {}, callback) {

        const query = this._model.find(filter)
        .select(options.filter || this._options.fields)
        .populate(options.populate || this._options.populate)
        .sort(options.sort || this._options.sort)

        if(callback){
            const dataResult = new DataResultCollectionEntity()
            query.then(docs => {
                dataResult.data = docs
                dataResult.count()
            }).catch(ex => {
                dataResult.status = 500
                dataResult.message = 'Server Error'
                dataResult.errors.push({ code: 'server', text: ex.message })
            }).finally(() => {
                callback(dataResult)
            })
        }else{
            return query
        }
    }

    findById (id, options = {}, callback) {
        const query = this._model.findById(id)
        .select(options.filter || this._options.fields)
        .populate(options.populate || this._options.populate)
        return this._returnData(query, callback)
    }

    findOne (filter, options = {}, callback) {
        const query = this._model.findOne(filter)
        .select(options.filter || this._options.fields)
        .populate(options.populate || this._options.populate)
        return this._returnData(query, callback)
    }
}