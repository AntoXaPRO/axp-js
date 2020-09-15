import DataResult from './data-result'

/**
 * Модель данных (коллекция), возвращаемых контроллерами.
 */
export default class DataResultCollection extends DataResult {
    constructor(data = []){
        super()
        // Возвращаемая коллекция.
        this.data = data
        // Общее кол-во эллементов в коллекции.
        this.total = this.count()
    }

    /**
     * Подсчёт общего кол-ва в коллекции.
     */
    count() {
        if(this.data){
            this.total = this.data.length
        }
        return this.total
    }
}