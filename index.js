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
    'GST Treatment',
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

// var to hold zoho bill status
var zoho_gst_treatment = 'out_of_scope'

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

    console.log(emp_id)
    console.log(emp_name)
    console.log(emp_gross)
    console.log(emp_pf)
    console.log(emp_tds)
    console.log(emp_pt)
    // add an early check
    if (!emp_id)
        return

    // pad emp_id to 4 digits
    emp_id = emp_id.trim().padStart(4, "0")
    // emp name
    emp_name = emp_name.trim()

    // cleanup numerical values
    zoho_map.gross.amount = numeral(emp_gross).value()
    zoho_map.pf.amount = numeral(emp_pf).value() * -1
    zoho_map.tds.amount = numeral(emp_tds).value() * -1
    zoho_map.pt.amount = numeral(emp_pt).value() * -1

    // set zoho bill number for this row
    zoho_bill_number = 'PR-' + moment(payslipsDate).format('YYYY-MMM-').toUpperCase() + emp_id

    console.log(zoho_bill_date)
    console.log(zoho_bill_number)
    // console.log(zoho_map);

    Object.keys(zoho_map).forEach(function (key) {
        if (zoho_map[key].amount) {
            zoho_aoa.push([zoho_bill_date, zoho_bill_number, zoho_bill_status, zoho_gst_treatment, emp_name,
                zoho_map[key].account,
                zoho_map[key].description,
                zoho_map[key].amount
            ])
            console.log(zoho_map[key].amount)
        }
    });

    console.log("========\n")
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
        var emp_name = item[' Name '] ? item[' Name '] : item['Name']
        var emp_gross = item[' GROSS '] ? item[' GROSS '] : item['GROSS']
        var emp_pf = item[' PF '] ? item[' PF '] : item['PF']
        var emp_tds = item[' INCOME TAX '] ? item[' INCOME TAX '] : item['INCOME TAX']
        var emp_pt = item[' PROF TAX '] ? item[' PROF TAX '] : item['PROF TAX']

        add_zoho_rows(emp_id, emp_name, emp_gross, emp_pf, emp_tds, emp_pt)

    }) //end of forEach

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
