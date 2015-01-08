var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('OclEhy9yJMhoDetSuxFCcg');

var fs = require('fs');
var ejs = require('ejs');
var FeedSub = require('feedsub');
 
var csvFile = fs.readFileSync("friends_list.csv","utf8");
var emailTemplate = fs.readFileSync('email_template.ejs', 'utf8');

var blogContent = new FeedSub('http://vatteh.github.io/atom.xml', {
    emitOnStart: true
});

var latestPosts = [];

blogContent.read(function(err, blogPosts) {

    var currentDate = new Date();
    blogPosts.forEach(function(post) {
      var postDate = new Date(post.published);
      if ((currentDate - postDate) < (30 * 24 * 60 * 60 * 1000)); //(day * hour * min * sec * msec)
        latestPosts.push(post);
    });

    csvData = csvParse(csvFile);
    csvData.forEach(function(row){
      firstName = row["first_name"];
      monthsSinceContact = row["months_since_contact"];
      copyTemplate = emailTemplate;
      var customizedTemplate = ejs.render(copyTemplate, {
          firstName: firstName,
          monthsSinceContact: monthsSinceContact,
          latestPosts: latestPosts
      }); 
      sendEmail(firstName, row["email_address"], "Victor", "victoratteh@gmail.com", "Sup dude!", customizedTemplate);

    });
});

function csvParse(csvFile) {
	parsed = [];
	csvFile.split('\n').forEach( function(element, index) {
	  	if (index === 0)
	  		return;
	  	element = element.split(',');
	  	if (element.length !== 4)
	  		return;
	  	parsed.push({	'first_name': element[1],
	  					'last_name': element[0],
	  					'months_since_contact': element[2],
	  					'email_address': element[3]
	  				});
	});

	return parsed;
}

function sendEmail(to_name, to_email, from_name, from_email, subject, message_html) {
  var message = {
      "html": message_html,
      "subject": subject,
      "from_email": from_email,
      "from_name": from_name,
      "to": [{
              "email": to_email,
              "name": to_name
          }],
      "important": false,
      "track_opens": true,    
      "auto_html": false,
      "preserve_recipients": true,
      "merge": false,
      "tags": [
          "Fullstack_Hexomailer_Workshop"
      ]    
  };
  var async = false;
  var ip_pool = "Main Pool";
  mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
      // console.log(message);
      // console.log(result);   
  }, function(e) {
      // Mandrill returns the error as an object with name and message keys
      console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
      // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
  });
};
