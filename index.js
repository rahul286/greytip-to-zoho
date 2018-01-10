/*
    Dependencies
*/

//@src https://github.com/wanasit/chrono
var chrono = require('chrono-node')

//@src http://momentjs.com/docs/
var moment = require('moment')

//@src http://numeraljs.com/
var numeral = require('numeral')

//@src https://nodejs.org/api/path.html
const path = require('path')

//@src https://github.com/SheetJS/js-xlsx
var XLSX = require('xlsx')

/*
    Prepare Zoho CSV
*/

// initialise an empty array
var zoho_aoa = []

// push csv header row
zoho_aoa.push([
    'Bill Date',
    'Bill Number',
    'Bill Status',
    'Vendor Name',
    'Account',
    'Description',
    'Rate'
])

// payslipsDate hold Date object created from first row of input excel
var payslipsDate

// var to hold zoho bill date
var zoho_bill_date

// var to hold zoho bill status
var zoho_bill_status = 'Overdue'

// Chart of Accounts and Description mapping
var zoho_map = {
    gross: {
        account: 'Employee Salary Expense',
        description: 'Gross Salary'
    },
    pf: {
        account: 'Employees Provident Fund Payable',
        description: 'Provident Fund'
    },
    tds: {
        account: 'TDS Payable Employee Salary (192/92B)',
        description: 'TDS (Income Tax)'
    },
    pt: {
        account: 'Professional Tax Payable (MH)',
        description: 'Professional Tax'
    }
}

// console.log(zoho_map);

// function to add a row to zoho CSV

var add_zoho_rows = function (emp_id, emp_name, emp_gross, emp_pf, emp_tds, emp_pt) {
    // pad emp_id to 4 digits
    emp_id = emp_id.padStart(4, "0")

    // cleanup numerical values
    emp_gross = numeral(emp_gross).value()
    emp_pf = numeral(emp_pf).value() * -1
    emp_tds = numeral(emp_tds).value() * -1
    emp_pt = numeral(emp_pt).value() * -1

    // set zoho bill number for this row
    zoho_bill_number = 'PR-' + moment(payslipsDate).format('YYYY-MMM-').toUpperCase() + emp_id

    console.log(emp_id)
    console.log(emp_name)
    console.log(emp_gross)
    console.log(emp_pf)
    console.log(emp_tds)
    console.log(emp_pt)
    console.log(zoho_bill_date)
    console.log(zoho_bill_number)
    console.log(zoho_bill_status)

    console.log("========\n")

    // gross salary
    zoho_aoa.push([zoho_bill_date, zoho_bill_number, zoho_bill_status, emp_name,
        zoho_map.gross.account, zoho_map.gross.description, emp_gross
    ])

    // pf deduction
    zoho_aoa.push([zoho_bill_date, zoho_bill_number, zoho_bill_status, emp_name,
        zoho_map.pf.account, zoho_map.pf.description, emp_pf
    ])

    // tds deduction
    zoho_aoa.push([zoho_bill_date, zoho_bill_number, zoho_bill_status, emp_name,
        zoho_map.tds.account, zoho_map.tds.description, emp_tds
    ])

    // pt deduction
    zoho_aoa.push([zoho_bill_date, zoho_bill_number, zoho_bill_status, emp_name,
        zoho_map.pt.account, zoho_map.pt.description, emp_pt
    ])

} //end of add_zoho_row()

var greytipToZoho = function (infile, outfile) {
    /*
        Error checking
    */
    console.log(infile);
    console.log('default outfile' + outfile);

    /*
        Open input file
    */
    var wb = XLSX.readFile(infile)
    var ws = wb.Sheets.Sheet0

    /*
        Set payslips date
    */
    // pd = chrono.parseDate('Salary Statement For The Month Of Jul 2017')
    payslipsDate = chrono.parseDate(ws['A1'].v)
    //2017-07-31T06:30:00.000Z - make date last day of month
    payslipsDate.setMonth(payslipsDate.getMonth() + 1)
    payslipsDate.setDate(0)
    // set zoho bill date as it will be same for entire run
    zoho_bill_date = moment(payslipsDate).format('YYYY-MM-DD')

    // debug log
    console.log(payslipsDate)

    /*
        Set range to payroll data
    */

    var wj = XLSX.utils.sheet_to_json(wb.Sheets.Sheet0, {
        range: 2
    })

    // console.log(wj)

    /*
        Process salary records
    */

    wj.forEach(function (item) {
        // extract data required by zoho
        var emp_id = item[' Employee No '] ? item[' Employee No '] : item['Employee No']

        // add an early check
        if (! emp_id ){
            return
        }

        var emp_name = item[' Name '] ? item[' Name '] : item['Name']
        var emp_gross = item[' GROSS '] ? item[' GROSS '] : item['GROSS']
        var emp_pf = item[' PF '] ? item[' PF '] : item['PF']
        var emp_tds = item[' INCOME TAX '] ? item[' INCOME TAX '] : item['INCOME TAX']
        var emp_pt = item[' PROF TAX '] ? item[' PROF TAX '] : item['PROF TAX']

        add_zoho_rows(emp_id, emp_name, emp_gross, emp_pf, emp_tds, emp_pt)

    }) //end of forEach

    // debug
    // console.log(zoho_aoa)
    // console.log("========\n")

    /*
        Save output
    */

    //create new empty workbook
    var zoho_workbook = XLSX.utils.book_new()

    //create new sheet from zoho array data
    var zoho_sheet = XLSX.utils.aoa_to_sheet(zoho_aoa)

    //add newly created sheet to newly created workbook
    XLSX.utils.book_append_sheet(zoho_workbook, zoho_sheet)

    //save newly created workbook on fs
    if (typeof outfile == 'undefined') {
        outfile = path.dirname(infile) + '/' + 'zoho-payroll-' + moment(payslipsDate).format('YYYY-MMM') + '.csv'
        console.log('new outfile path' + outfile)
    }

    XLSX.writeFile(zoho_workbook, outfile)

    return outfile
}

//export
module.exports = greytipToZoho

//exec
//greytipToZoho('sample.xls')
