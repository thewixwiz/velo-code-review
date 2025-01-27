const bestPractices = `
Velo: Best Practices for Building a Site with Velo

Give Your Element IDs and Functions Meaningful Names
Using meaningful names for element IDs and functions makes your code easier to write, read, and maintain. For example, suppose you have a button on your page that is used to submit data to a collection. Changing the button's ID from button1 to submit will make it easier to find in the Autocomplete when you're assigning it an onClick() function. It will also be easier to understand what your code is doing when you or someone else looks at your code, possibly at a later date.

Copy
// do this
$w("#submitButton").onClick(submitData);

// don't do this
$w("#button1").onClick(mysteryFunction);
Catch Errors in Your Code
You should always strive to catch all the errors that might occur in your code and never let them propagate to the browser. When you catch errors before they make it to the browser, you can handle them gracefully.

There are a few techniques you will need to use to catch the various types of errors that may occur. When working with asynchronous functions that return a Promise that may reject, you should always include a catch() to handle rejections. Also, before retrieving data that may not exist, you should check for existence before reading the data.

For example, here we query a collection. We have added code to catch two types of errors.

Copy
wixData
  .query("myCollection")
  .find()
  .then((results) => {
    // this "if" makes sure we don't try to read data that doesn't exist
    if (results.items.length > 0) {
      $w("myRepeater").data = results.items;
      $w("#message").hide();
    } else {
      $w("#message").text = "No items found.";
      $w("#message").show();
    }
  })
  // the catch handles cases where there is a system error in
  // retrieving the data.
  .catch((err) => {
    $w("#message").text = "Error retrieving data.";
    $w("#message").show();
  });
Format Your Code
Code that is well-formatted is easier to read and maintain. Keeping proper indentation provides readers of your code, including yourself, with visual cues for understanding how the code is structured.

Sometimes, when writing code, you are more focused on getting your code to work than writing it as neatly as possible. That's why we've provided the code formatting feature in the right-click menu. It removes extra lines and fixes your indentation.

Code Only One onReady() Per Page
The code you place in an onReady() callback runs when your page loads.

Technically, you can call onReady() several times to create several callbacks that run when your page loads. However, doing so fragments your code, making it more difficult to read and maintain, without providing any obvious benefit. So keep to one onReady() per page.

Note however, that if you have an onReady() defined in masterPage.js and one defined on a page, when that page loads, both onReady() callbacks will run. This is fine, because the site onReady() deals with elements that are shown on all your site's pages, whereas your page onReady() deals only with the elements on that specific page.

Set Events Only Once
You should only set a particular event handler for an element one time. It's important to understand that each time you set an event handler, you are adding a new handler, and not replacing the old one. So, if you set an event handler for a button using its onClick() function and then later attempt to "reset" the event handler by calling onClick() again, you have now defined two onClick() behaviors. Meaning, when the button is clicked, they will both run and you do not know which will run first.

You should also avoid using both code and the link panel from the editor to add a link to an element. 



Creating links both in the editor and code can result in a conflict that will produce unreliable functionality. 

Try Using $w(“Type”) for Selecting Multiple Elements
Did you know that there are multiple ways to select elements using the $w() selector function?

We all know that you can select one element at a time by providing the $w() function with a hashtag followed by an element ID.

But you can also select elements by type by providing the $w() function with the type name. For example, to select all buttons on a page, you can use $w('Button'). The function call returns an array containing all the buttons on the page. You can then use that array to perform actions on all the buttons at once with a single function call. For example, to disable all the buttons on a page, you can use $w('Button').disable().

Use masterPage.js
The masterPage.js file is located in the Page Code section of the Code sidebar (Wix Studio), or the Code sidebar (Wix Editor). Use it for elements that appear on all of your site's pages. Typically, these will be elements that you put in your site's header or footer. 

Code for elements that are set to show on all pages can also be placed in masterPage.js.

If you try to select a regular page element from masterPage.js, it will cause an error on all pages other than the one on which the element exists.

Note Don't import functions from masterPage.js into the code files of individual pages. Doing this will cause the masterPage onReady function to run twice on that page. If there's a function that you want to use in the code for multiple pages, store it in a public .js file and import it from there.

Declaring Variables Wisely
Whenever feasible, use const instead of let to declare variables. Doing so signals your intent that the variable's value should not change. Never use var to declare variables.

Avoid using global variables in your code. Global variables are prone to being overwritten and can hide the logic of your code. Instead of using a global variable, pass the variable as a parameter to the functions where it is needed.

Avoid Large Blocks of Code by Using Functions
Avoid writing large blocks of code. Wherever feasible, break your code down into smaller related parts and extract out to smaller functions. This makes your code easier to read and help with code reusability.

Be Aware of Browser-Specific Code Requirements
Web browsers process JavaScript code in different ways. Functionality supported by some browsers might not be supported by others. For example, on Apple iOS, the Safari and Chrome browsers do not support the regular expression lookbehind syntax. Many online resources allow you to quickly look up different browser requirements. 

Security
As you plan your site and consider security issues, you should review the full Velo Security Considerations. The following is a summary of the issues we suggest you consider.

Secure Private Information and Resources with the Secrets Manager
You may need to add private information such as an API key to your site's code. API keys and other secrets are sensitive resources and should never be added to your page, site, and public code, since anyone can access them. Backend code is secured, but you should still follow security best practices and store your secrets separately from the code.

Instead of hardcoding your secrets, you can use the Secrets Manager and the Velo Secrets API to safely work with secrets in your code. Using the Secrets Manager also hides secrets from Site Contributors and only allows Admins to view them.

Secure Sensitive Information in the Backend
All the code in Page Code and Public code files is visible to any user who visits your site, even the code in Page Code files on a password-protected page or a members-only page. You should therefore only put sensitive information in Backend code files and not Page Code or Public code files.

The code in Backend files is not visible to site visitors but it may still be vulnerable without appropriate security validations. You should therefore implement validation mechanisms in your Backend code files where necessary. You can learn more about your code’s visibility and how to protect it.

Set Appropriate Permissions for Backend Web Modules
Web Module permissions allow you to control which users can work with functionality in your site that depends on your Web Module functions.

Setting Web Module permissions allows you to ensure that no one can access or use your exported backend webModules in ways that you didn't intend.

Set Appropriate Permissions for Database Collections
You should always set the permissions of your database collections to be as restrictive as possible and to reflect your collection's common usage. Each permission should only be granted to the Admin role unless there is a specific reason to grant the permission to additional roles. Even when there is a reason to grant a permission to more roles, you should only grant it to the roles that need it.

If you need to grant particular permissions that don’t fit the products permissions model, you should consider creating a specific flow of data access for the special use-case, without changing permissions for the entire collection, by using webModules and the suppressAuth property of the WixDataOptions object, or with data hooks.

When to Use “suppressAuth”
There may be times when you want to use the suppressAuth property to call wix-data functions on a collection without the permission checks that are set for that collection. You should only use suppressAuth after you run the appropriate security validations. For example, you may need to check that the visitor is a member of a specific group.

Overriding Permission Requirements with elevate()
Newer APIs use the wix-auth elevate() function rather than suppressAuth to override permission requirements. Elevating a function allows it to be called by any site visitor. In some cases, elevating a function is required in order to use the function at all. Exercise caution and only elevate functions you are willing to let any site visitor call.

Validate Authorized Requests for HTTP Functions
You should validate your http functions to ensure you are handling an authorized request. This is usually accomplished by checking for a shared value in an authorization header.

Performance
These tips will help you to take performance considerations into account when building your Velo website.

Change Text Dynamically
There are cases where you might want to add multiple overlapping text elements to your page and display each text when a specific condition is met (for example, success and error messages). But adding a lot of elements to your page can slow down your site. 

Instead of using multiple text elements, you can use a single text element and change the displayed text dynamically. You can use $w.Text.text to change plain text and $w.Text.html to change styled text. As an added bonus, text is easier to manipulate using this method.

Improve Performance in Sites with Database Collections
Using data from database collections or from a 3rd-party source can be a powerful tool to enhance your site's functionality. However, sending a lot of data to the browser from the server (where your data is stored) can be a time-consuming operation that might negatively affect your site's loading time. Therefore, you want to minimize the amount of data that is sent from the server to the browser. 

Whether you're using a dataset or the Data API, there are several approaches you can follow to improve your site's performance.

Use async/await in onReady()
Using async/await functionality in your onReady() function delays the rendering of your page elements, decreasing the performance of your site. In many cases you'll want to avoid using async/await in onReady() for this reason. As an alternative, you can use the .then() function.

On the other hand, delaying the rendering of your page elements allows database content to load in time for search bots to index your content, which is important for SEO. You'll need to decide what's best for your site on a case-by-case basis.

For more information on handling promises with async/await or .then, see Working with Promises.

Avoid Code that Could Result in Repeater Performance Limitations
If you’re working with dynamic repeater content that is updated fairly often, and especially if you are filtering or sorting your repeater data, you may not want to bind event handlers to repeater item elements from within the onItemReady() function. Although it is convenient to do so using the scoped $item selector, this practice may cause several event handlers to be set for the same item, as well as add multiple copies of the callback function to the event handler, affecting the performance of your site.

Alternatively you can combine the use of some of the following APIs to bind your repeater items:

$w Element API at()
Repeater APIs forItems() and forEachItem()
Dataset APIs getCurrentItem() and getCurrentItemIndex()
Be Mindful of Data and Backend Quotas
Wix places quotas on data and backend code requests on your site. Data requests include using the Content Management System (CMS), Datasets, Wix Forms, and Velo’s Wix Data API. Backend requests include calls to web modules from your frontend code, using routers hooks, and calling HTTP functions. You can take steps to make sure your code isn't exceeding the quotas.

Learn more about working with data and backend quotas.

Database Collections
Take a few minutes to review these best practices for working with database collections and configuring datasets.

Validate User Input Before Storing It in a Collection
Collections are important data stores. To make sure that the data in your collection is valid, complete, and consistent, validate the input data before storing it in a collection.

Validate your input data at the field level using the input element’s settings:

Data type
Maximum and minimum values
Maximum character length
Regex validation patterns
For more complex validations use the onCustomValidation() event handler. Both the field setting and custom validations are triggered by the valid property.

To validate entire records, use the wix-data hooks beforeInsert, beforeUpdate() and beforeRemove. Hooks give you the ability to control the data going into your collection with backend code, processed before it gets to your collection. Hooks are independent of the front end and will run regardless of what triggers the write – frontend code, the content manager, or importing data (Sandbox only).

When using a dataset, use the onItemValuesChange, and onBeforeSave to validate data before the save() is executed.

See About Validating User Input with Code for more information.

Datasets: Read or Write? (Be Careful With Both!)
Datasets can be configured as read, write, or read-write. Read-write datasets should only be used where both read and write or update are required. When using a read-write dataset, take care to understand all of the potential flows that may exist.

Let’s take a common use case where we have a collection with existing data, a table to display that data, and a set of input elements below the table to allow the visitor to edit the selected row. We have buttons for submit, and delete, connected to the submit, and remove functions in the dataset. We also have a new button connected to the 'New' function in the dataset which will create a new blank item, ready for editing in the input elements. The table, the input elements and the buttons, are all connected to a read-write dataset. As the visitor clicks on each row in the table, the values of the input elements are updated with the values of the selected row. The visitor can now edit the contents of a row and click submit to save the data.


The following flows can produce some unexpected outcomes:

Be careful when using lists and repeaters with read-write datasets. From our common use case above, if a row was selected, and the values changed in the input elements, selecting another row will cause the changed data to be saved without clicking Submit. This happens because any change to the dataset’s index will save the changed data to your collection. The index can be changed by selecting a different item in a connected list or by using the setCurrentItemIndex() function.
Pages should only allow the selection and editing of a single item. Use the revert() function or a button connected to the Revert dataset action, if you want your visitors to be able to undo changes.
Avoid overwriting existing data when trying to create new items. Use the new() function or a button connected to the New dataset action.
In our common use case, site visitors may try to delete an item by deleting the contents of each input element, and clicking Submit. This will update the selected item setting each field to blank but will not delete the item. Use the remove() function or a button connected to the Delete dataset action for any delete operations. Make sure that your site visitor can clearly identify which item is to be deleted.
A read-write dataset reads your data when the page is ready, so if you are building a form to update a collection, the read-write dataset displays the first item in the collection in your input fields.
From a performance point of view, when your page loads, a read-write dataset will take more time as it has to retrieve the data from the collection. Speed up page loading by implementing the minimum functionality required.
When to Use Datasets and When to Use Code

First of all, we recommend that you don’t use both together!

For simple applications with little potential for change in the structure of your collections, datasets provide a fast, safe, and managed solution. Datasets are very easy to implement with no coding needed, and provide a quick and easy interface to your collections.

If your application is complex, with processing required before displaying or saving your data, coding the interface using the wix-data API is a better choice. Coding is more flexible and easier to extend and modify than datasets. When using code, you control the entire interaction with the collection. wix-data provides functions, callbacks, and hooks giving you the option to run procedures and validate your data at critical points in your process. These points include before and after read, create, update, and delete operations. Coding also gives you more complex query filters and the ability to use aggregations for reporting applications.

In general code runs faster than a dataset, especially if you have many datasets on the same page. However, dynamic datasets can be faster due to the way they request the data. Also bear in mind that you can use caching with a dataset but not with code.  For better code performance, you can run the code on the backend, lightening the load on the browser.

If you do decide to mix code and datasets, be careful. Multiple processes acting on the same data can have unpredictable outcomes and lead to corruption and inconsistencies in your collections. No one wants that.

`

const security = `
Security Best Practices
In general, a site is secure without having to do anything. Wix takes care of that. However, there are certain situations where you have to take some precautions so that you don't expose sensitive data to a site's visitors.

Collection permissions
If you are using custom collections you should always set the permissions of your database collections to be as restrictive as possible. If the collection contains sensitive data such as PII or secrets, the Read permissions should be granted for the Admin role only, unless there is a reason to grant a specific permission for additional roles. Even when there is a reason to grant a permission for more roles, you should only grant it for the roles that need it.

Also, to prevent anyone from removing or updating the data, you should set the Update and Remove permissions to the Admin role. Or, if there is a UX flow for users to update or remove the data, then you can set those permissions to Site member author.

Here are some examples:

Example	Recommended permission settings
Scenario: Form submission	
An input form that you want anyone to be able to use.	
Solution	
On the collection that the form is connected to, set the create permissions to the Anyone role. Keep all the other permissions restricted to the Admin role.	Read: Admin
Create: Anyone
Update: Admin
Delete: Admin
Scenario: Site content	
A page that displays content from a collection to anyone.	
Solution	
Set the read permission of that collection to the Anyone role. Keep all the other permissions restricted to the Admin role.	Read: Anyone
Create: Admin
Update: Admin
Delete: Admin
Scenario: Member-generated content	
A member-generated comments section where members can post comments that anyone can see, but only the poster can update or delete the comment.	
Solution	
Set each permission based on who needs to access it.	Read: Anyone
Create: Site member
Update: Site member author
Delete: Site member author
Unused permissions
Be careful when granting a permission to a collection even if you don't expose that collection’s functionality in your site.

Here are some examples:

Unused create permission

If your site doesn’t contain a form for site visitors to create content for a specific collection, you may think you can safely set the create permission for that collection to Anyone. That is not the case. A malicious site visitor can inject data into your collection without a form. Make sure your collection is protected by restricting the create permission to the Admin role.

Unused read permission

If you have a collection for internal use that you don't use on any of your site's pages, you may think you can safely set the read permission for that collection to Anyone. That is not the case. A malicious site visitor can still read the data from this collection. Make sure your collection is protected by restricting the read permission to the Admin role.

Temporarily bypass collection permissions
Sometimes, you may need to grant access to collection data only in a specific situation or only to a specific user. You may need to expose some of the data in a collection, while keeping the rest private. In these cases, extending the permissions of the collection to more users is a security risk. Doing this exposes all the collection data to users with the permitted roles all the time. Instead, set the collection permissions as appropriate for most situations. Then, when you need to grant access to the collection to a specific user or for a specific use case, perform that operation in backend code.

You can grant temporary access to collections using the suppressAuth parameter that’s available as an option for many Wix Data functions. Setting suppressAuth to true allows a data request in backend code to interact with a collection even if the site visitor requesting the data doesn’t have permission to access that collection. To grant temporary access to a collection, define a function in your backend code that makes a data request using suppressAuth. Export this function for use in your frontend code. See About Collection Permissions for more information.

Note

A backend function that suppresses Wix Data's permissions checks must do at least one of the following:
   (a) Perform its own checks before accessing a collection.
   (b) Filter out sensitive collection data before passing anything back to frontend.
Anyone can call exported backend code, as described below. This code therefore presents a serious security risk. 
Only suppress permission checks when absolutely necessary. Leave Wix Data’s permissions checks enabled as much as possible. This way, even backend operations run only for users who have been granted permission for that operation.
Here are 2 examples of using suppressAuth to grant specific and temporary access to collection data:

Access for site members with specific roles

Wix allows you to create custom roles for site members. However, you currently can’t set collection permissions by role. To allow only members with a certain role to access a collection, set the collection’s permissions to Admin. Then, implement backend code that suppresses permission checks for site members with the desired role.

Show me how
Access to specific collection fields

Some collections contain both private and public data. In this case, you may want to expose the public data to site visitors while keeping the private data secure. To do this, set the collection’s permissions to Admin. Then, implement backend code that suppresses permission checks and returns only the public data.

Show me how
This code uses suppressAuth to query a collection and returns only the '_id' and 'comment' fields.

Copy
import wixData from 'wix-data';
export function getData(){
   return wixData.query("myCollection")
   .find({"suppressAuth": true})
   .then((results) => {
      if (results.totalCount > 0) {
        const filteredResults = results.items.map( (item) => {
           return {"\_id" : item.\_id, "comment" : item.comment}
        })
        return filteredResults
      }
   })
   .catch((error) => {
     console.log("Error:", error.message);
   });
}
Storing personal information in a collection
You can store a site visitor’s personal information in a collection, provided that you set the collection permissions so that only the Site member author can read, update, or delete content.

You may also want to store visitor information using the built-in Contact List. This allows you to use this information with all the other contact list functionality that Wix provides. You can then also use Velo APIs to perform operations that involve site members or contact data.

The following APIs are available:

wix-crm.v2
wix-crm-frontend
wix-crm-backend
wix-members.v2
wix-members-frontend
wix-members-backend
Signup forms
When you set up a member signup form for your site, you have 2 options for limiting who is allowed to sign up:

Everyone: When a new member signs up, they are approved automatically. You do not need to do anything.
People I approve: When a new member signs up, you receive a notification, both by email and in your site's dashboard, asking if you want to approve or reject them. Only those who you approve become site members.
If your site members have permissions for any of the collections on your site, then enabling automatic approval of new members sign up is the same as setting those permissions to collections to Anyone. This is because anyone can now become a site member and use the site member permissions. This is a potential security concern. You should think carefully about whether site members have access to any sensitive collection information before allowing anyone to become a member.

Code visibility
All page and public code is visible to any site visitor. Note that page code on a password protected page or members only page can be viewed by any site visitor, including those who don't have the password and are not members. Therefore, don't expose sensitive information in page or public code, including in the masterpage.js file.

Backend code is not visible to site visitors. It's safe to use sensitive information there and export the results to frontend code. However, even though malicious visitors can't see what exported backend functions do, they can still call those functions if they know their names.  They can do this using any arguments they want, and examine any return values. Therefore, any exported backend code should perform validations before carrying out potentially harmful operations or returning sensitive information. Also, backend functions that are not called from public code should not be exported from .web.js or .jsw files.



API keys
If you access a 3rd party service that requires an API key or other sensitive information, you should always store that information in the Secrets Manager. Never use API keys in page, public, or masterpage.js code. Instead, export a function from a backend web module that uses the Secrets API to extract the key and calls the 3rd party service. Call that function from your page, public, or masterpage.js code.

Signup and login forms
If your site has a Member's Area, you can add forms using signup and login pages. One type of form you can add lets you use code to customize member signup and login. Because signing up and logging in involve the transfer of sensitive information, it’s best to prevent signup & login API calls from running in the frontend when using a form.

Validations and checks
If you want to perform a security check or validation in your code, you should always do so using backend code. Any check or validation in your page, public, or masterpage.js code can be easily read, manipulated, and circumvented by a malicious site visitor.

For example, consider the following Page code intended to reveal a secret key to a specific site visitor:

Copy
import { currentMember } from "wix-members-frontend";

$w.onReady(() => {
  $w("#validateButton").onClick(() => {
    currentMember.getMember().then((member) => {
      if (member.loginEmail === "secretemail@mail.com") {
        // show secret key
        $w("#secretText").text = "43ne5gfou94tfe";
      } else {
        // show denial message
        $w("#secretText").text = "Access denied!";
      }
    });
  });
});
There are two major problems with this code:

The security check is revealed to all site visitors. Anyone can see that the correct email address is secretEmail@mail.com.
Sensitive information is revealed to all site visitors. Anyone can see that the secret code is 43ne5gfou94tfe. 
The correct way to do this is to move both the security check and the secret code to a backend web module as follows:

Copy
// In backend file: secureModule.web.js
import { Permissions, webMethod } from "wix-web-module";
import { currentMember } from "wix-members-backend";
import { getSecret } from "wix-secrets-backend";

export const secureCheck = webMethod(Permissions.Anyone, async () => {
  try {
    const member = await currentMember.getMember({ fieldsets: ["FULL"] });
    const memberEmail = member.loginEmail;
    const secretEmail = await getSecret("secretEmail"); // "secretemail@mail.com"

    if (memberEmail === secretEmail) {
      const secretValue = await getSecret("secretValue"); // "43ne5gfou94tfe"
      return secretValue;
    } else {
      return "Access denied!";
    }
  } catch (err) {
    console.error(err);
    return "An error occurred";
  }
});
Although malicious site visitors can call the backend function, they can't gain any information by doing so since the function doesn’t reveal any sensitive information. You can call this function safely from page code as follows:

Copy
import { secureCheck } from "backend/secureModule.web";

$w.onReady(() => {
  $w("#secretButton").onClick(() => {
    secureCheck().then((message) => {
      $w("#secretText").text = message;
    });
  });
});
This page code is visible to any site visitor. However, since all the security check logic was moved to backend code, seeing the code doesn't reveal any sensitive information to malicious site visitors.

`

const instructions =
    `
Anaylize the code file based on the Wix Best Practices, Security Recommendations, and general best practices.
There is no minimum requirement of issues to detect. If there are no issues or suggestions just return an empty array. 
Return a JSON object.
`

const end = `
This is the end of the instructions and context, following is the code to be analyzed:

`

function getPrompt() {
    return instructions + bestPractices + security + end ;
}

module.exports = { getPrompt };