/*
    Dependencies
*/

//@src https://github.com/wanasit/chrono
var chrono = require('chrono-node')

//@src http://momentjs.com/docs/
var moment = require('moment')

//@src http://numeraljs.com/
var numeral = require('numeral')

//@src https://github.com/SheetJS/js-xlsx
var XLSX = require('xlsx')

var greytipToZoho = function (infile) {
    /*
        Error checking
    */
    console.log(infile);

    /*
        Zoho CSV Defaults
    */

    /*
        Open input file
    */

    var wb = XLSX.readFile(infile)
    var ws = wb.Sheets.Sheet0


    /*
        Set payslips date
    */

    // pd = chrono.parseDate('Salary Statement For The Month Of Jul 2017')
    var payslipsDate = chrono.parseDate(ws['A1'].v)

    //2017-07-31T06:30:00.000Z - make date last day of month
    payslipsDate.setMonth(payslipsDate.getMonth() + 1)
    payslipsDate.setDate(0)

    // debug log
    console.log(payslipsDate)


    /*
        Set range to payroll data
    */

    var wj = XLSX.utils.sheet_to_json(wb.Sheets.Sheet0, {
        range: 2
    })

    // debug log
    // console.log("========\n")
    // console.log(wj)

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
        // 'GST Treatment',
        'Vendor Name',
        'Account',
        'Description',
        'Rate'
    ])

    /*
        Process salary records
    */

    wj.forEach(function (item) {
        //skip empty
        if ('' == item['Employee No'].trim()) {
            return
        }
        // console.log(item)
        // console.log(item['Employee No'])
        // console.log(item[' Name '])
        // console.log(item[' GROSS '])
        // console.log(item[' PF '])
        // console.log(item[' INCOME TAX '])
        // console.log(item[' PROF TAX '])
        // console.log("========\n")

        //push GROSS salary
        if (parseFloat(item[' GROSS '].trim()) > 0) {
            zoho_aoa.push([
                //'Bill Date'
                moment(payslipsDate).format('YYYY-MM-DD'),
                //'Bill Number'
                'PR-' + moment(payslipsDate).format('YYYY-MM-') + item['Employee No'].trim().padStart(4, "0"),
                //'Bill Status'
                'Overdue',
                //'GST Treatment'
                // 'business_unregistered',
                // 'Vendor Name'
                item[' Name '].trim(),
                // 'Account'
                'Employee Salary Expense',
                // 'Description'
                'Gross Salary',
                // 'Rate'
                numeral(item[' GROSS ']).value()
            ])
        } //end GROSS salary

        //push PF
        if (parseFloat(item[' PF '].trim()) > 0) {
            zoho_aoa.push([
                //'Bill Date'
                moment(payslipsDate).format('YYYY-MM-DD'),
                //'Bill Number'
                'PR-' + moment(payslipsDate).format('YYYY-MM-') + item['Employee No'].trim().padStart(4, "0"),
                //'Bill Status'
                'Overdue',
                //'GST Treatment'
                // 'business_unregistered',
                // 'Vendor Name'
                item[' Name '].trim(),
                // 'Account'
                'Employees Provident Fund Payable',
                // 'Description'
                'Provident Fund',
                // 'Rate'
                numeral('-' + item[' PF ']).value()
            ])
        } //end PF

        //push INCOME TAX
        if (parseFloat(item[' INCOME TAX '].trim()) > 0) {
            zoho_aoa.push([
                //'Bill Date'
                moment(payslipsDate).format('YYYY-MM-DD'),
                //'Bill Number'
                'PR-' + moment(payslipsDate).format('YYYY-MM-') + item['Employee No'].trim().padStart(4, "0"),
                //'Bill Status'
                'Overdue',
                //'GST Treatment'
                // 'business_unregistered',
                // 'Vendor Name'
                item[' Name '].trim(),
                // 'Account'
                'TDS Payable Employee Salary (192/92B)',
                // 'Description'
                'TDS (Income Tax)',
                // 'Rate'
                numeral('-' + item[' INCOME TAX ']).value()
            ])
        } //end INCOME TAX

        //push PROF TAX
        if (parseFloat(item[' PROF TAX '].trim()) > 0) {
            zoho_aoa.push([
                //'Bill Date'
                moment(payslipsDate).format('YYYY-MM-DD'),
                //'Bill Number'
                'PR-' + moment(payslipsDate).format('YYYY-MM-') + item['Employee No'].trim().padStart(4, "0"),
                //'Bill Status'
                'Overdue',
                //'GST Treatment'
                // 'business_unregistered',
                // 'Vendor Name'
                item[' Name '].trim(),
                // 'Account'
                'Professional Tax Payable (MH)',
                // 'Description'
                'Professional Tax',
                // 'Rate'
                numeral('-' + item[' PROF TAX ']).value()
            ])
        } //end PROF TAX

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
    XLSX.writeFile(zoho_workbook, 'zoho-payroll-' + moment(payslipsDate).format('YYYY-MMM') + '.csv')
}

//export
module.exports = greytipToZoho

//exec
//greytipToZoho('sample.xls')
