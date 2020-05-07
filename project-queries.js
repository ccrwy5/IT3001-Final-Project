// Chris Rehagen
// IT3001 - Final Project

// 1. How many employees report Mary Patterson and William Patterson?
db.employees.find( { "reportsTo": "William Patterson" } ).count() // 3
db.employees.find( { "reportsTo": "Mary Patterson" } ).count() // 4

db.employees.find({$or : [{"reportsTo" : "William Patterson"},{"reportsTo" : "Mary Patterson"}]}).count() // 7
db.employees.find({$and:[{"reportsTo" : "William Patterson"},{"reportsTo" : "Mary Patterson"}]}).count() // 0

// 2. Calculate the total payments made by Marseille Mini Autos

db.customers.aggregate([
  {
    $match : { "customerName": "Marseille Mini Autos" }
  },
  {
    $project: { count: {$size : "$payments"} }
  }
]);

// 3. Show the dollar value (buyPrice * quantityInStock)of each product in inventory

db.products.aggregate(
  [
    { $project: {  dollar_price: { $multiply: [ "$buyPrice", "$quantityInStock" ] } } }
  ]
)

// 4. Show the total dollar value (buyPrice * quantityInStock)of all products in inventory

db.products.aggregate(
   [
     {
       $group:
         {
           _id: {},
           totalAmount: { $sum: { $multiply: [ "$buyPrice", "$quantityInStock" ] } },
           totalItems: { $sum: 1 }
         }
     }
   ]
)

// 5. Dislpay the customer name and the contact person's first and last name for customers with total payments of $100,000 or greater

db.customers.find({
    "payments.amount": {
        "$gt": 100000
    }
}, {
    "contactFirstName": 1,
    "contactLastName":1,
    "customerName":1
});

// 6. Display the customer name, employee name, and order amount for orders of $30,000 or greater

db.orders.find({
    "order_details.quantityOrdered": {
        "$gt": 10
    }
}, {
    "customerName":1,
    "employeeName":1,
    "order_details.quantityOrdered":1
});

// db.orders.aggregate(
//    [
//      { $project: { customerName: 1, employeeName: 1, quantityOrdered: { $multiply: [ "$order_details.quantityOrdered", "$order_details.priceEach" ] } } }
//    ]
// )

db.orders.aggregate([
    {
      "$project": {
        "customerName": 1,
        "total": {
            "$sum": {
                "$map": {
                    "input": "$order_details",
                    "as": "order_details",
                    "in": { "$multiply": [
                        { "$ifNull": [ "$$order_details.quantityOrdered", 0 ] },
                        { "$ifNull": [ "$$order_details.priceEach", 0 ] }
                    ]}
                }
            }
        }
      }
    },
    {
      "$group": {
        "_id": "$customerName",
        "total": { "$sum": "$total" }
      }
    },
    {
      "$match": {"sum": { $gte: 30000 } }
    }
])

// 7. Display the names of employees who work in offices outside of the United States.

db.employees.find({
    "office.country": {
        "$ne": "USA"
    }
}, {
    "lastName":1,
    "firstName":1,
    "office.country":1
});

// 8. Display the customer name and order number for orders that shipped within 5 days of the required date

// Convert date strings to actual dates
db.orders.find({requiredDate: {$not: {$type: 9}}}).forEach(function(doc) {
    // Convert created_at to a Date
    doc.requiredDate = new Date(doc.requiredDate);
    db.orders.save(doc);
})

db.orders.find({shippedDate: {$not: {$type: 9}}}).forEach(function(doc) {
    // Convert created_at to a Date
    doc.shippedDate = new Date(doc.shippedDate);
    db.orders.save(doc);
})


db.orders.aggregate(
   [
     {
       $project: {
          requiredDate: { $dateToString: { format: "%Y-%m-%d", date: "$requiredDate" } },
          shippedDate: { $dateToString: { format: "%Y-%m-%d", date: "$shippedDate" } }
       }
     }
   ]
)
//Works
//db.orders.aggregate( [ { $project: { _id: 1, dateDifference: { $subtract: [ "$requiredDate", "$shippedDate" ] } } } ] )

db.orders.aggregate([
     {$project: {
         "orderNumber": 1,
         "customerName":1,
         "diff_msecs": {
             /* Calculate date difference in milliseconds */
             $subtract:[
                 "$requiredDate",
                 "$shippedDate"
                 ]
             }
         }
     },
     {$project: {
         "customerName": 1,
         "diff_days": {
             /* Convert the previous result in milliseconds to days */
             $divide: [
                 "$diff_msecs",
                 1000 * 60 * 60 * 24
                 ]
             },
             "Less than 5 days?": { $lt: [ { $divide: [ "$diff_msecs", 1000 * 60 * 60 * 24]}, 5 ] }
         }
     }]
   )

// Attept 2
 //   db.orders.aggregate(
 //  [
 //    {
 //      $group :
 //        {
 //          _id : "_id",
 //        }
 //     },
 //    {
 //     $addFields :
 //        {
 //          "diff_msecs": { $subtract:["$requiredDate", "$shippedDate"]},
 //          "diff_days": { $divide: [ "$diff_msecs", 1000 * 60 * 60 * 24]}
 //        }
 //    },
 //    {
 //       $match: { "diff_days": { lt: 5 } }
 //    }
 //   ]
 // )
