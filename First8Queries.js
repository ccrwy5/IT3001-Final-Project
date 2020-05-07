// 1. Create a bar chart to display the number of customers each employee has
db.customers.aggregate( [
  {
    $group: {
       _id: "$salesRepEmployeeNumber",
       count: { $sum: 1 }
    }
  }
] )

// 2. Create a bar chart to show the top 10 products by name that appear in the most orders.
// Not units ordered, but number of orders. For example,
//if product A had orders of 5, 5, and 10 units, that’s three orders because three orders were placed.


db.orders.aggregate( [ {
   $unwind: "$order_details" },
   { $sortByCount: "$order_details.productName" },
   { $limit : 10 }
 ] )


// 3. Create a bar chart to show the top 10 products by name with have the highest dollar value in orders?

db.orders.aggregate(
   [
     { $unwind: "$order_details" },
     { $project: { "order_details.productName": 1, total: { $multiply: [ "$order_details.priceEach", "$order_details.quantityOrdered" ] } } },
     { $sort : { total : -1 } },
     { $limit : 10 }

   ]
)

// 4. Create a Bar Chart showing the order numbers with the 10 highest totals?
db.orders.aggregate(
   [
     { $unwind: "$order_details" },
     { $project: { orderNumber: 1, total: { $multiply: [ "$order_details.priceEach", "$order_details.quantityOrdered" ] } } },
     { $sort : { total : -1 } },
     { $limit : 10 }
   ]
)

// 5. Create a horizontal bar graph showing which customers (by name) placed the most orders.

db.customers.aggregate([
  {
    $project:
    {
      customerName:1,
      number_of_orders: {$size : "$payments"}
    }
  },
  { $sort :
    {
      number_of_orders : -1
    }
  },
]);

// 6. Create a pie chart showing payments collected by each year

db.customers.aggregate(
   [
     { $unwind: "$payments" },
     {
       $project:
          {
            _id: 1,
            yearSubstring: { $substr: [ "$payments.paymentDate", 0, 4 ] }
          }
      },
      {
        $group: {
           _id: { year : "$yearSubstring" },
           count: { $sum: 1 }
        }
      }
   ]
)

// 7. Create a bar graph showing payments collected each by month in 2004

db.customers.aggregate(
   [
     { $unwind: "$payments" },
     {
       $project:
          {
            _id: 1,
            yearSubstring: { $substr: [ "$payments.paymentDate", 0, 4 ] },
            monthSubstring: { $substr: [ "$payments.paymentDate", 5,2]}
          }
      },
      {
        $match : { "yearSubstring": "2004" }
      },
      {
        $group: {
           _id: { month : "$monthSubstring" },
           count: { $sum: 1 }
        }
      },
      {
        $sort: {
          count: -1
        }
      }
   ]
)

// 8. Create a line chart showing payments received by day in December 2004.
// Note, there can be multiple payments received in a day

db.customers.aggregate(
   [
     { $unwind: "$payments" },
     {
       $project:
          {
            _id: 1,
            yearSubstring: { $substr: [ "$payments.paymentDate", 0, 4 ] },
            monthSubstring: { $substr: [ "$payments.paymentDate", 5,2]},
            daySubString: { $substr: [ "$payments.paymentDate", 8,2]}

          }
      },
      {
        $match : { "yearSubstring": "2004" }
      },
      {
        $group: {
           _id: { day : "$daySubString" },
           count: { $sum: 1 }
        }
      },
      {
        $sort: {
          count: -1
        }
      }
   ]
)

// 9. Create a bar graph showing the names of the 10 customers Classic Model Company has collected the most payments from.
db.customers.aggregate([
  {
    $project: { customerName: 1, count: {$size : "$payments"} }
  },
  {
    $sort: {
      count: -1
    }
  },
  {
    $limit : 10
  }
]);

// 10. Create a pie chart showing customers by state

db.customers.aggregate([
		{
      $group : {
        _id:"$state",
        count:{
          $sum:1
        }
      }
    },
    { $sort: { "count": -1 } },
    { $match: { _id: { $ne: null } }}
	])

// 11. Create a bar chart showing which employees manages the most employees

db.employees.aggregate([
		{
      $group : {
        _id:"$reportsTo",
        count:{
          $sum:1
        }
      }
    },
    { $sort: { "count": -1 } }
	])

// 12. Show the top 7 employee names (first and last) who have taken the most orders

db.orders.aggregate([
		{
      $group : {
        _id:"$employeeName",
        count:{
          $sum:1
        }
      }
    },
    { $sort: { "count": -1 } },
    { $match: { _id: { $ne: null } }}
	])

// 13. Create a bar chart to display total payments received by country.

db.customers.aggregate([
   {
      $project: {
         country: 1,
         numberOfPayments: { $cond: { if: { $isArray: "$payments" }, then: { $size: "$payments" }, else: "NA"} }
      }
   },
   {
     $group: {
       _id: "$country",
       numberOfPayments: { $sum: 1}
     }
   }
] )

// 14. Display in a bar chart the employee names and the total dollar value of orders they accounted for.
// db.orders.aggregate(


db.orders.aggregate([
    { $unwind: "$order_details" },
    { $project: {
        "employeeName": 1,
        "value": { "$multiply": [
            { "$ifNull": [ "$order_details.priceEach", 0 ] },
            { "$ifNull": [ "$order_details.quantityOrdered", 0 ] } 
        ]}
    }},
    { $group: {
        "_id": "$employeeName",
        "total": { "$sum": "$value" }
    }}
])
