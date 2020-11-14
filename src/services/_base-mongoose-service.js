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

    /**
     * Приватный метод для валидация данных по модели.
     * @param { Object } obj - Объект сущности.
     */
    _validFormModel(obj){
        let result = { obj }
        if(this._formModel){
            const model = new this._formModel(obj)
            if(model.isValid()){
                result.obj = model.convertPreSave()
            }else{
                result.errors = model.errors
            }
        }
        return result
    }

    /**
     * Приватный метод для обработки результата создания/редактирования.
     * @param { Promise } promise - Промис выполнения сохранения сущности в БД.
     */
    _returnResultOrCllback(promise, callback, successStatus = 200){
        // Возвращаем данные.
        if(callback){
            const dataResult = new DataResultEntity()
            promise.then(doc => {
                dataResult.status = successStatus
                dataResult.message = 'The data was successfully stored'
                dataResult.data = doc
            }).catch(ex => {
                dataResult.status = 500
                dataResult.message = 'Server Error'
                dataResult.errors = ex
            }).finally(() => {
                callback(dataResult)
            })
        }else{
            return promise
        }
    }

    /**
     * Создание сущности.
     * @param { Object } obj - Объект сущности.
     * @param { Function } callback - Функция обратного вызова (аргумент функции DataResultEntity)
     */
    create(obj, callback){
        // Валидация данных.
        const validResult = this._validFormModel(obj)

        // Промис обновления.
        const promise = new Promise((resolve, reject) => {
            if(validResult.errors){
                reject(validResult.errors)
            }else{
                this._model.create(validResult.obj)
                .then(doc => resolve(doc))
                .catch(ex => reject([{ code: 'create', text: ex.message }]))
            }
        })

        // Возвращаем данные.
        return this._returnResultOrCllback(promise, callback, 201)
    }

    /**
     * Редактирование сущности.
     * @param { Object } obj - Объект сущности.
     * @param { Function } callback - Функция обратного вызова (аргумент функции DataResultEntity)
     */
    update(obj, callback){

        // Валидация данных.
        const validResult = this._validFormModel(obj)

        // Промис обновления.
        const promise = new Promise((resolve, reject) => {
            if(validResult.errors){
                reject(validResult.errors)
            }else{
                this._model.findByIdAndUpdate(validResult.obj._id, validResult.obj, { new: true, runValidators: true })
                .then(doc => resolve(doc))
                .catch(ex => reject([{ code: 'update', text: ex.message }]))
            }
        })

        // Возвращаем данные.
        return this._returnResultOrCllback(promise, callback)
    }

    /**
     * Создание/Редактирование сущности.
     * @param { Object } obj - Объект сущности.
     * @param { Function } callback - Функция обратного вызова (аргумент функции DataResultEntity)
     */
    createOrUpdate (obj, callback){
        if(obj._id){
            return this.update(obj, callback)
        }else{
            return this.create(obj, callback)
        }
    }

    /**
     * Удаление сущности из БД.
     * @param { String } id - ИД сущности в БД.
     * @param { Function } callback - Функция обратного вызова (аргумент функции DataResultEntity)
     */
    remove(id, callback){
        const promise = new Promise((resolve, reject) => {
            this._model.findByIdAndRemove(id)
            .then(doc => resolve(doc))
            .catch(ex => reject([{ code: 'remove', text: ex.message }]))
        })
        return this._returnResultOrCllback(promise, callback)
    }

    /**
     * Возвращает коллекцию.
     * @param { Object } filter - Объект фильтра для выборки из БД.
     * @param { Object } options - Доп. настройка для выборки (select, populate, sort)
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

    /* 
    Нужно удалить */
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
}