# Explanation of the source material

This is all about a client that did some research on the resistance to change in big companies.

He studied this framework to categorize in a systematic way, how difficult or easy could be to create some change in a company.

The way he did it, is explained in the thesis folder. The details of the statistical analysis are in the auswertung example folder.

The idea is to make a web application that will help evaluate this for big companies.

Currently he wants me to make a demo, on how we could do this survey with good UX.

The purpose is that he can share this webapp with some potential customers, and this potential customers will share this with their employees.

The employees will fill out the surveys, and then the potential customers will be able to see the evaluation automatically.

The main account is the admin, thats gonna be my customer. He can login and type in who he wants to share the webapp with.
For example he has a potential customer, lets say SAP. He will add SAP on the admin dashboard, and then he can share credentials with SAP so they can login.

Now SAP can spread the survey with the employees and see the results of the anonimous survey, and see in real time the results as people fill out the survey.

The auswertung_example is the part on how the statistical result is done. and the advantage of the webapp, is that it centralizes all the different tools and steps that were needed before to perform the evaluation.

Thats the value of this webapp, and what this demo should highlight.

You dont need to create a google form, then copy the results to an excel, do the auswertung and come up with shitty graphs in an excel.

Everything can be done from the webapp. To be clear, this is not even an MVP. is a Demo.

This means, we dont care about edge cases. Nothing related to the startup phase or anything. Nothing to worry about.

Basically my customer will share it with people he trust so we dont need to ensure data consistency, everything has to be as lean and simple as possible.

We just need to showcase how everything can be centralized in a beautiful webapp.

Later, if the customers of my customer care about this, we worry about making this production ready. 

For now this should be as simple as possible. AKa. a nextjs app, public folder, deployed in Vercel, with better auth, only email-password credentials and Neon database with postgres.
Tailwind, Schadcn UI, Tanstack everything: Forms, Charts etc...


There is also a word document that contains something like a bitacore, but that one is just something my customer share to explain the ausswertung and the examples.
There its indicated in more detail what my customer wants.  We agree to use that document to document his requests.
You can find there some information about the survey and how the results of the survey are evaluated.


The umfrage folder is where the survey is located.  Its a link to a google form, which is what my client used to distribute the survey and collect the responses before.
Also it has the questions in text form. 

