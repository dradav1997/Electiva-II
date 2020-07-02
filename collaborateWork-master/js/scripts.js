function onlyNums(e) {
    const code = window.event ? e.which : e.ketCode;
    return !(code < 48 || code > 57);
}
var bill = [{
        "billNumber": "345345",
        "billDate": "2017-7-21",
        "paymentType": "Credito",
        "term": "30",
        "totalValue": 234454,
        "pays": []
    },
    {
        "billNumber": "872034",
        "billDate": "2020-6-25",
        "paymentType": "Contado",
        "term": "0",
        "totalValue": 7435246,
        "pays": []
    },
    {
        "billNumber": "293658",
        "billDate": "2018-12-4",
        "paymentType": "Credito",
        "term": "90",
        "totalValue": 932937,
        "pays": []
    }
]
class Pay {
    constructor(no, date, pay, balance, note) {
        this.date = date,
            this.pay = pay,
            this.balance = balance,
            this.note = note,
            this.no = no
    }
}

function output_table_pays(No_bill, No_Pays, total_pays, due_date, balance) {
    this.No_bill = No_bill,
        this.No_Pays = No_Pays,
        this.total_pays = total_pays,
        this.due_date = due_date,
        this.balance = balance
}
var datos = [];
$(() => {
    $('#table_1').DataTable({
        "data": bill,
        "columns": [
            { "data": "billNumber" },
            { "data": "billDate" },
            { "data": "paymentType" },
            { "data": "term" },
            { "data": "totalValue" }
        ],

        "paging": false,
        "searching": false,
        "ordering": false,
        "info": false,
        "responsive": true
    });
    //Agregar los # de factura al select
    for (bills of bill) {
        $('#numeroFac').append(new Option(bills.billNumber))
    }
    //Agregar el valor del saldo según el # de factura
    $('#numeroFac').on('change', () => {
        const number = $('#numeroFac option:selected').val()
        $('#saldo').val(get_balance(number))
        const value = $('#saldo')
        var chain = String(value.val()).replace(/\D/g, "")
        const newValue = new Intl.NumberFormat('en-US').format(chain)
        value.val("$" + newValue)
    })
})

$('#saldo').on('change', () => {
    const value = $('#saldo')
    var chain = String(value.val()).replace(/\D/g, "");
    chain = chain.val().replace(/([0-9])([0-9]{2})$/, '$1.$2');
    const newValue = new Intl.NumberFormat('en-US').format(chain);
    value.val(newValue);
})



$('#abono').on('keyup', () => {
    const number = $('#numeroFac option:selected').val()

    const value = $('#abono')
    var chain = String(value.val()).replace(/\D/g, "")
    var amount = parseInt(value.val().replace(/[^a-zA-Z0-9]/g, ''))
    const newValue = new Intl.NumberFormat('en-US').format(chain)
    value.val("$" + newValue);



    $('#nuevoSaldo').val(calculate_new_balance(number, amount))
    const value2 = $('#nuevoSaldo')
    var chain2 = String(value2.val()).replace(/\D/g, "");
    const newValue2 = new Intl.NumberFormat('en-US').format(chain2);
    value2.val("$" + newValue2);
})

$('#enviar').click(function() {
    var factura = $('#numeroFac option:selected').val();
    var nuevo = $('#abono').val();
    var obse = $('#obser').val();
    nuevo = parseInt(nuevo.replace(/[^a-zA-Z0-9]/g, ''));
    make_payment(factura, nuevo, obse)
    $('#saldo').val(get_balance(factura));
    $('#abono').val(0)
        //No_bill, No_Pays, total_pays, due_date, balance
    print_pays()
});
//Prueba de modificación en el Array OK
$('#cancel').click(function() {
    var factura = $('#numeroFac option:selected').val();
    $.each(bill, function(i, val) {
        if (bill[i].billNumber === factura) {
            alert("Nuevo saldo :" + bill[i].totalValue);
        }
    });
});


//-------------------------------------------------------- Funciones ---------------------------------------------------
// imprimir tabla abonos
function print_pays() {
    //No_bill, No_Pays, total_pays, due_date, balance
    var print = []
    $.each(bill, function(i, _bill) {
        var date = new Date(_bill.billDate);
        var days = parseInt(_bill.term);

        print.push(new output_table_pays(_bill.billNumber, num_pays(_bill.billNumber), get_total_pays(_bill.billNumber), fechaVen(date, days), get_balance(_bill.billNumber)))
    })

    var table = null
    $('#tblBody').empty();
    $('#table_2').DataTable().destroy();
    table = $('#table_2').DataTable({
        "data": print,
        "columns": [
            { "data": "No_bill" },
            { "data": "No_Pays" },
            { "data": "total_pays" },
            { "data": "due_date" },
            { "data": "balance" },
            {
                "defaultContent": "<button type='button' class='selec btn btn-primary sm' data-toggle='modal' data-target='#buscar'></button>",
                "className": "text-center"
            }
        ],
        "paging": false,
        "searching": false,
        "ordering": false,
        "info": false,
        "responsive": true
    })

    $("#table_2 tbody").on("click", "button.selec", function() {
        var data = table.row($(this).parents('tr')).data()
        print_pays_table(data.No_bill)
    })

}

function print_pays_table(No_bill) {
    //No_bill

    /**
     * this.date = date,
            this.pay = pay,
            this.balance = balance,
            this.note = note,
            this.no = no
     */

    var pays = get_bill(No_bill).pays

    $('#tblBody').empty();
    $('#table_3').DataTable().destroy();
    var table = $('#table_3').DataTable({
        "data": pays,
        "columns": [
            { "data": "no" },
            { "data": "date" },
            { "data": "note" },
            { "data": "pay" },
            { "data": "balance" },
        ],
        "paging": false,
        "searching": false,
        "ordering": false,
        "info": false,
        "responsive": true
    })
}
// obtener factura
function get_bill(billNumber) {
    var output
    $.each(bill, function(i, _bill) {
        if (_bill.billNumber === billNumber) {
            //alert(JSON.stringify(bill[i]))
            output = i
        }
    })
    return bill[output]
}

// hacer el pago y agregarlo al arreglo de pago de la factura
function make_payment(billNumber, amount, note) {
    let balance
    var _bill = get_bill(billNumber)
    if (_bill.pays.length === 0) {
        balance = _bill.totalValue - amount
    } else {
        let No_pays = _bill.pays.length
        balance = _bill.pays[No_pays - 1].balance - amount
    }
    let pay = new Pay((_bill.pays.length + 1), new Date().toISOString().slice(0, 10), amount, balance, note)
    _bill.pays.push(pay)
        //alert(JSON.stringify(_bill.pays))
        //alert(JSON.stringify(bill))
}

//calcular nuevo saldo si se hace un pago
function calculate_new_balance(billNumber, amount) {
    let my_bill = get_bill(billNumber)
    let No_pays = my_bill.pays.length
    if (No_pays === 0) {
        return my_bill.totalValue - amount
    }
    return (my_bill.pays[No_pays - 1].balance - amount)
}

// obtener saldo
function get_balance(billNumber) {
    let my_bill = get_bill(billNumber)
        //alert(JSON.stringify(my_bill))
    if (my_bill.pays.length === 0) {
        return my_bill.totalValue
    }
    let No_pays = my_bill.pays.length
    return my_bill.pays[No_pays - 1].balance
}

function num_pays(billNumber) {
    let my_bill = get_bill(billNumber)
    return my_bill.pays.length
}

function get_total_pays(billNumber) {
    let my_bill = get_bill(billNumber)
    var pays = my_bill.pays
    var plus_total = 0
    $.each(pays, function(i, _dates) {
        plus_total += _dates.pay
    })
    return plus_total
}
// calcular fecha de vencimiento
function fechaVen(fecha, dias) {
    var date = fecha.getDate()
    fecha.setDate(date + dias)
    fechaGuar = fecha.toISOString().slice(0, 10);

    return fechaGuar;
}

// obtener informacion 
var get_data_set = function(tbody, table) {
    $(tbody).on("click", "button.selec", function() {
        var data = table.row($(this).parents('tr')).data()
            //alert(JSON.stringify(data))
        print_pays_table(data.No_bill)
    })
}

// limiar todo
function clean() {
    var BillNumber = $('#numeroFact')
    var balance = $('#saldo')
}