#!/usr/bin/env node

//
// Utility script for joining two csv files, based on a common column.
// This vas used to join the Timisoara street names with id numbers.
// Author: Petru Isfan
//
var fs = require('fs');
var lazy = require('lazy');

var separator = ",",
	file1 = null,
	file2 = null;
//
// Check comamnd line parameters
//
if ( process.argv.length != 4) {
	console.log("Syntax: ");
	console.log(process.argv[1], "<file1>", "<file2>");
} else if (process.argv.length == 4) {
	file1 = process.argv[2],
	file2 = process.argv[3];
	
	if ( ! fs.existsSync(file1)) {
		console.log(file1, " - invalid argument");
		return;
	}
	if ( ! fs.existsSync(file2)) {
		console.log(file2, " - invalid argument");
		return;
	}		
}
//
// Read first file line by line, and return an array of {id: ..., name: ...}
// 
new lazy( fs.createReadStream( file1 ))
     .lines
     .skip(1)					// skip header
     .map(function(line) {
		var column = line.toString().split(separator);
		return {
			id: column[0],
			name: column[2].replace(/\"/g,"").trim()		// replace " and remove leading and trailing space
		}
     })
     .join(function (ids) {
     	//
     	// Read second file line by line and search the name in the previous list
     	// When you find the name, replace the id cell.
     	//
     	new lazy( fs.createReadStream( file2 ))
		     .lines
		     .forEach(function(line){
		         var column = line.toString().split(separator);
		         var streetName = column[1].replace(/\"/g,"").trim();
		         
		         var id = -1;
		         for (var i=0; i < ids.length; i++ ) {
		         	if (ids[i].name == streetName ) {
		         		id = ids[i].id;
		         		break;
		         	}
		         	// if (streetName.indexOf("JOHANN") != -1 && ids[i].name.indexOf("JOHANN") != -1) {
		         	// 	console.log(streetName);
		         	// 	console.log(ids[i].name);
		         	// }
		         }
		         // if (id == -1) {
		         // 	console.log(streetName);
		         // }
		         column[0] = id;
		         //
		         // Output the result to standard output.
		         //
		         console.log(column.join());
		     }
		);
     })
