const { Yup } = axpJs
const { DataResultEntity, _BaseValidEntity } = axpJs.entities

class TestModel extends _BaseValidEntity {
    constructor(obj = {}){
        super(obj, {
            name: Yup.string().lowercase().required(),
            email: Yup.string().required().email(),
            age: Yup.number().required().positive().integer(),
            website: Yup.string().required().url()
        })
    }
}

const jsonViewer = new JSONViewer()

new Vue({
    el: '#app',
    vuetify: new Vuetify(),
    data: () => ({
        jsonViewer,
        model: new TestModel(/* { 
            name: 'AntoXa',
            email: 'infoantoxa.pro',
            age: 34,
            website: 'https://vuetifyjs.com/en/components/date-pickers/#formatting-with-external-libraries',
            description: 'Тестовае описание.'
        } */)
    }),
    mounted() {
        this.showJSON(new DataResultEntity())
    },
    methods: {
        showJSON(dataResult){
            document.querySelector("#json").appendChild(jsonViewer.getContainer())
            dataResult = JSON.stringify(dataResult)
            this.jsonViewer.showJSON(JSON.parse(dataResult), null, 2)
        },
        submit() {
            console.log(this.model.obj)
            const result = new DataResultEntity(this.model.obj)

            if(this.model.isValid()){

                result.data = this.model.obj

                this.model = new TestModel()
            }else{
                result.status = 401
                result.message = 'Bad Request'
                result.errors = this.model.errors
            }

            this.showJSON(result)
        }
    }
})