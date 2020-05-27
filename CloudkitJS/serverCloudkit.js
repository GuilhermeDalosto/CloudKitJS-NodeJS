window.addEventListener('cloudkitloaded', function () {
  console.log("listening for cloudkitloaded");
  
// Configure the database of container
  CloudKit.configure({
    containers: [{
      // 3
      containerIdentifier: 'iCloud.SongProject',
      apiToken: 'a2fb0b8e90843173485f3b99b6f35e4bd1f36e371f858265f11faacdaf450817',
      environment: 'development'
    }]
  });
  
  var container = CloudKit.getDefaultContainer();
  var publicDB = container.publicCloudDatabase;

  container.setUpAuth()
    .then(function (userInfo) {

      // Fetch data in the Cloudkit
      publicDB.performQuery({ recordType: 'Sala'}).then(function (response) {
        if (response.hasErrors) {
          console.error(response.errors[0]);
          return;
        }
        var records = response.records;
        
        var numberOfRecords = records.length;
        if (numberOfRecords === 0) {
          console.error('No matching items');
          return;
        }
        
      }).catch(function (error) {
        console.log(error);
      })
    });

    // Update data in the Cloudkit
    self.saveNewItem = function() {
      if (self.newShort().length > 0 && self.newLong().length > 0) {
        self.saveButtonEnabled(false);
        var record = { recordType: "Sala",
            fields: { short: { value: self.newShort() },
              long: { value: self.newLong() }}
        };
        publicDB.saveRecord(record).then(function(response) {
          if (response.hasErrors) {
            console.error(response.errors[0]);
            self.saveButtonEnabled(true);
            return;
          }
          var createdRecord = response.records[0];
          self.items.push(createdRecord);
          self.newShort("");
          self.newLong("");
          self.saveButtonEnabled(true);
        });
      } else {
        alert('Error setup');
      }
    };

// Set the Sucscription types
var querySubscription = {
  subscriptionType: 'query',
  subscriptionID: userInfo.userRecordName,
  firesOn: ['create', 'update', 'delete'],
  query: { recordType: 'Sala', sortBy: [{ fieldName: 'short'}] }
};

// Fetch for subscriptions in Cloud
publicDB.fetchSubscriptions([querySubscription.subscriptionID]).then(function(response) {
  if(response.hasErrors) {  // subscription doesn't exist, so save it
    publicDB.saveSubscriptions(querySubscription).then(function(response) {
      if (response.hasErrors) {
        console.error(response.errors[0]);
        throw response.errors[0];
      } else {
        console.log("successfully saved subscription")
      }
    });
  }
});

// Register for Notifications in the Cloud
container.registerForNotifications();
container.addNotificationListener(function(notification) {
  console.log(notification);
  self.fetchRecords();
});




});