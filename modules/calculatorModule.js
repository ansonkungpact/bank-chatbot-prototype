var _ = require('underscore');
var luisModule = require('./luisModule.js');

/*****
Globally declared random set of questions
****/
const QUESTIONS = {
	"START_QUESTION": [
		"Hello Mr. Woo, how can I help you today?"
	],
	"RESTART_QUESTION": [
		"What can I help you with?"
	],
	"LOST_CARD_1": [
		"I'm sorry to hear that. I can definitely help you with canceling and issuing a new card."
	],
	"LOST_CARD_2": [
		"But first, just to verify who you are, I will need to ask you a security question."
	],
	"LOST_CARD_3": [
		"In which city were you born?"
	],
	"BORN_LOCATION_1": [
		"Great. Thank you, Mr. Woo."
	],
	"BORN_LOCATION_2": [
		"Now, can you tell me when the card was lost?"
	],
	"LOST_DATE": [
		"Thank you. So just to confirm, was the card lost as of "
	],
	"CARD_REVIEW_1": [
		"Ok, got it. The good news is that since you are reporting your loss promptly, you will not be responsible for any unauthorised charges. "
	],
	"CARD_REVIEW_2": [
		"I do see, however, that there are some transactions dated since [#Date]. Would you like to review them?"
	],
	"TRANSACTION": [
		"There is a transaction on 2-Mar for HKD 255.00 at Fortress. Is this an authorized charge?"
	],
	"TRANSACTION_AUTH_1": [
		"Great. In that case, we will process this transaction as usual."
	],
	"TRANSACTION_AUTH_2": [
		"There is another transaction here for HKD 888.00 at Lucky Fortunes. Is this an authorized charge?"
	],
	"INVERTIGATE": [
		"I see. In that case, we will investigate further and let you know shortly."
	],
	"CARD_CANCEL": [
		"I will now go ahead and cancel your card and send you a new one."
	],
	"ASK_FOR_COVERAGE":[
		"What type of coverage would you like to inquire about? (Hospitalization, Outpatient, or Dental)"
	],
	"ASK_FOR_OUTPATIENT_TYPE_SERVICE": [
		"Can you provide 9 digit <strong>FWD Policy Number</strong>?"
	],
	"ASK_FOR_TYPE_HEALTH_INSURANCE": [
		"What type of Outpatient coverage are you looking for? (Physician, Physiotherapist / Chiropractor, Specialist, Chinese Medicine Practitioner, or Diagnostic X-Ray / Lab Tests?)"
	],
	"ASK_FOR_OUT_PATIENT_SERVICE": [
		"Which Outpatient service you want to know?<span class='help-text'>(Physician, Physiotherapist / Chiropractor, Specialist, Chinese Medicine Practitioner, Diagnostic X-Ray / Lab Test)</span>"
	],
	"ASK_FOR_DIFFERENT_TYPE": [
		"Which other service you want to know?<span class='help-text'>(Physician, Physiotherapist / Chiropractor, Specialist, Chinese Medicine Practitioner, Diagnostic X-Ray / Lab Test)</span>"
	],
	"ASK_FOR_SERVICE": [
		"What kind of services you want to know?<span class='help-text'>(Coverage, Benefit Used / Benefit Remaining , Claim Steps)</span>"
	],
	"ASK_FOR_FINAL_SERVICE": [
		"What kind of services you want to know?<span class='help-text'>(Coverage, Benefit Used / Benefit Remaining , Claim Steps)</span>"
	],
	"DO_NOT_UNDERSTAND": [
		"I'm sorry,  but I didn't understand your answer.",
		"I unfortunately did not understand that but I will try my best to learn it in the future.",
		"Apologies, but I didn't quite understand that. I'll look into learning that phrase shortly."
	],
	"COVERAGE_DETAILS":[
		"Here are your coverage details for Specialist care: <br> Cover Limit: (HK$) 400 <br> Reimbursement: 100% <br> Network co-payment per visit: 0 <br> Max. no. of visits per policy year: 30"
	],
	"POLICY_SUMMARY":[
		"And for your policy, here is a summary of the benefits used and benefits remaining for this policy year: <br> No. of visits claimed: 8 <br> Max. no. of visits remaining: 22",
		"And for your policy, here is a summary of the benefits used and benefits remaining for this policy year: <br> No. of visits claimed: 6 <br> Max. no. of visits remaining: 20"
	],
	"SPECIALIST_SEARCH":[
		"Would you like to search for any specialists in your area?"
	],
	"TYPE_OF_SPECIALIST":[
		"What type of Specialist are you looking for?"
	],
	"LIST_OF_DIABETES_DOC":[
		"Sure. Here is the list of Endocrinologists ('Diabetes doctor') in your area:"
	],
	"DOC_LIST":[
		"ABC Doc name"
	],
	"TRANSACTION_EXCEEDED_FROM_LUIS":[
		"I am sorry but I am quite busy at the moment. Can you re-send your last message?",
		"Apologies, but things are quite busy at this end. Could you kindly re-send your last message?"
	],
	"GOOD_BYE":[
		"Goodbye and have a great day!",
		"Bye! I look forward to chatting again soon!",
		"Take care and talk to you soon!"
	],
	"APOLOGY_FOR_REPEATING_QUESTION":[
	    "I am sorry, but I didn't understand your answer.",
		"I unfortunately did not understand your answer.",
		"Apologies, but I didn't quite understand that."
	],
	"HAPPY_TO_HELP":[
		"Sure, I would be happy to help you!"
	],
	"COVERAGE_ENQUIRY":[
		"I see here that you have an Employee Benefits Health policy with us at FWD. What type of coverage would you like to inquire about? (Hospitalization, Outpatient, or Dental)"
	],
	"RESTART":[
		"Is there anything else I can help with?"
	],
	"THANK_YOU":[
		"What else can I help you with?"
	],
	"NO_PHYSIOTHERAPIST_COVERAGE":[
		"I'm sorry, it appears you do not have Physiotherapist coverage in your policy."
	],
	"INFO_PHYSIOTHERAPIST_COVERAGE":[
		"Would you like some information on a policy with Physiotherapist coverage?"
	],
	"RELEVANT_POLICY":[
		"Sure, I would be happy to help you. Here is the information on the relevant policy."
	],
	"HEALTH_POLICY_OPTION":[
		"Please refer to this: <a href='https://www.ftlife.com.hk/tc/products/find-my-insurance.html' target='_blank'> https://www.ftlife.com.hk/tc/products/find-my-insurance.html </a>"
	],
	"BYE_BYE":[
		"Thank you. Bye bye."
	]

};


/*****
Actual Model functionality
****/

var cCalculatorModule = function (){
	var that = {};

	var isDevelopmentMode = false;
	
    var isCalculationInProgress = true;
	var extractionEngine = null;
	var extractsFromQuestion = {};
	var isLog = true;
	// set by default infant question to yes
	// extractsFromQuestion.QTAG5 = 'yes';
	var responseCallback = null;
	var currentQuestion = "";
	var currentQuestionBackup;
	var platformValue = 'WEB';
	var isLocationConflict = false;
	var autoCorrectedString = [];
	var identifiedAndCorrectedLocation = {};

	var entityToIgnore = [];

	var currentInputQuestion;
	var lastInputQuestion;
	var delayAccumulated;

	var shouldLearnLocation = false;
	var isLearningLocation = false;

	// constants

	var NODATAFOUND = "No Data Found";
	var LOCATIONINVALID = "LocationInvalid";

	// Greeting / Help
	var isHelpQuestionAsked = false;
	var isFAQIntentQuestionAsked;

	var userInputQuestion;
	var TOTAL_SPACE_IN_STATEMENT = 2;

	var log = function(msg) {
		console.log(msg);
	}

	var callback = function(questionKey, extraDelay) {
		var delay;
		var sequence = require('sequence').Sequence.create();
		sequence
			.then(function(next) {
					next();
				})
			.then(function(next) {
				delay = fetchCorrectQuestion(questionKey,extraDelay);

				return delay;

			});
	}


	var fetchCorrectQuestion = function(questionKey,extraDelay){
		log('questionKey in fetchCorrectQuestion:::'+questionKey);
		currentQuestion = questionKey;
		var question = getRandomQuestion(questionKey);

		if (!extraDelay) {
			extraDelay = 1;
		}

        if (currentInputQuestion != lastInputQuestion) {
        	lastInputQuestion = currentInputQuestion;
        	delayAccumulated = 0;
        	delay = getRandomDelay(question) + extraDelay;
        }
        else {
			delay = delayAccumulated + extraDelay; // for now, always add 100ms  
        }

		delayAccumulated = delay;
		delay = 400;

		if (responseCallback) {
			responseCallback(question, delay);
		}
	}


	var getRandomDelay = function(text) {
		// no. of characters to type / 20 * 1s + random (0~1s), cap it to max 3s
		var delay = Math.floor(Math.random() * 500); 
		delay += (JSON.stringify(text).length / 20) * 1000;
		delay = Math.min(delay, 3000);

		if (isDevelopmentMode) {
			delay = 0;
		}

		return delay;
	}

	 var getRandomQuestion = function(questionKey) {
		log(questionKey);
		var question = questionKey;

		var questions = QUESTIONS[questionKey];

		if (questions) {
			question = questions[Math.floor(Math.random() * questions.length)];
		}
		return question;
	}

	
	
	that.askChatBot = function(question, platform, widgetType,widgetData,callbackHandler) {
		log("askChatBot(): question=" + question);

		responseCallback = callbackHandler;
		platformValue = platform;
		userInputQuestion = question;

		currentInputQuestion = question;

		if(widgetType == null && question.trim() != '' && question.length > 0){

			//call LUIS NLC
			getClassifier(question,function(classifierResponse){
				var intent = classifierResponse["intent"];
				console.log("intent:::"+intent);
				if(intent == "greeting" || intent == "none"){
					callback("START_QUESTION");
				} else if (intent == "lostCard") {
					isCalculationInProgress = true;
					calculateInformation(question,classifierResponse);
				} else if(isCalculationInProgress) {
					calculateInformation(question,classifierResponse);
				}
				else {
					//seems some other intent
					callback("DO_NOT_UNDERSTAND");
				}
				
				
			},function(failureResponse){
				if(failureResponse == '429'){
					callback("TRANSACTION_EXCEEDED_FROM_LUIS");
				}else{
					callback(failureResponse);
				}
			});
		}
	}

	var cExtractionEngine = function() {
		var that = {};

		that.extractBookingRef = function(question) {
			var bookingRef = null;

			if (question) {
				var tokens = question.split(/[^A-Za-z0-9]/);
				tokens.some(function(word) {
					var re = /\b((?=.*\d)(?=.*[A-Za-z])[A-Za-z0-9]{6})\b/; 
					var m;

					if ((m = re.exec(word)) !== null) {
					    if (m.index === re.lastIndex) {
					        re.lastIndex++;
					    }
						bookingRef = m[0];

						return true;
					}
				})
			}

			return bookingRef;
		}

		return that;
	}

	var calculateInformation = function(question,classifierResponse){
		console.log('in calculateInformation');

		if(extractsFromQuestion.QTAG1 == null &&
			extractsFromQuestion.QTAG2 == null &&
			extractsFromQuestion.QTAG3 == null &&
			extractsFromQuestion.QTAG4 == null && 
			extractsFromQuestion.QTAG5 == null && 
			extractsFromQuestion.QTAG6 == null){
			// callback("HAPPY_TO_HELP");
			extractionOfParameters(question,classifierResponse);
		}else if(extractsFromQuestion.QTAG1 == null ||
			extractsFromQuestion.QTAG2 == null ||
			extractsFromQuestion.QTAG3 == null ||
			extractsFromQuestion.QTAG4 == null ||
			extractsFromQuestion.QTAG5 == null ||
			extractsFromQuestion.QTAG6 == null){
			
			extractionOfParameters(question,classifierResponse);
		}
	}

	var apologiesForRepeating = function(attemptedCallbackStr){
		if (attemptedCallbackStr == currentQuestion) {
			callback("APOLOGY_FOR_REPEATING_QUESTION");
		}
	}

	var showQuestion = function(questionType){
		apologiesForRepeating(questionType);
		callback(questionType);
	}


	var extractionOfParameters = function(question,classifierResponse){
		console.log('in extractionOfParameters');
		processInformation(question,classifierResponse,function(){

				log('------------------');
				log(extractsFromQuestion);
console.log(extractsFromQuestion.QTAG1);
console.log(extractsFromQuestion.RESTART);
				console.log(currentQuestion);
// console.log("testing here now anson kung");
				if(extractsFromQuestion.RESTART != null && extractsFromQuestion.RESTART == 'yes'){
					clearProfile();
					showQuestion("RESTART_QUESTION");
					extractsFromQuestion.RESTART = '';
				}else if(extractsFromQuestion.RESTART != null && extractsFromQuestion.RESTART == 'no'){
					clearProfile();
					showQuestion("BYE_BYE");
					extractsFromQuestion.RESTART = '';
				}else if(extractsFromQuestion.QTAG6 == 'negativeResponse'){
					showQuestion("INVERTIGATE");
					showQuestion("CARD_CANCEL");
					showQuestion("RESTART");
					clearProfile();
				}else if(extractsFromQuestion.QTAG5 == 'positiveResponse'){
					showQuestion("TRANSACTION_AUTH_1");
					showQuestion("TRANSACTION_AUTH_2");
				}else if(extractsFromQuestion.QTAG4 == 'positiveResponse'){
					showQuestion("TRANSACTION");
				}else if(extractsFromQuestion.QTAG4 == 'negativeResponse'){
					showQuestion("CARD_CANCEL");
					showQuestion("RESTART");
					clearProfile();
				}else if(extractsFromQuestion.QTAG3 == 'positiveResponse'){
					showQuestion("CARD_REVIEW_1");
					showQuestion("CARD_REVIEW_2");

				}else if(extractsFromQuestion.QTAG1 == null &&
						 extractsFromQuestion.RESTART == 'yes'){
					showQuestion("HELLO");

				}else if(extractsFromQuestion.QTAG1 == null &&
						 extractsFromQuestion.RESTART == 'no'){
					showQuestion("THANK_YOU");

				}else if(extractsFromQuestion.QTAG1 == null){
					showQuestion("LOST_CARD_1");
					showQuestion("LOST_CARD_2");
					showQuestion("LOST_CARD_3");
				}else if(extractsFromQuestion.QTAG2 == null){
					showQuestion("BORN_LOCATION_1");
					showQuestion("BORN_LOCATION_2");
				}else if(extractsFromQuestion.QTAG1 != null && 
						extractsFromQuestion.QTAG2 != null &&
						extractsFromQuestion.QTAG1 == "builtin.geography.city" &&
						extractsFromQuestion.QTAG2 == "builtin.datetime.date"){
					showQuestion("LOST_DATE");
				}
           });
	}

	
	var processInformation = function(question,classifierResponse,callbackFunc){
		log('in processInformation');
		var preExtractsFromQuestionStr = JSON.stringify(extractsFromQuestion);
		
		var sequence = require('sequence').Sequence.create();
		sequence
			.then(function(next) {
				console.log('5555');
					if(currentQuestion == ''){
						console.log('got current question correct');
						var entities = classifierResponse["entities"];
						for(var i=0;i<entities.length;i++){
							var entity = entities[i]['type'];
							console.log("entity:::"+entity);
							if (entity == "negativeResponse") {
								extractsFromQuestion.RESTART = 'no';
							} else if (entity == "positiveResponse") {
								extractsFromQuestion.RESTART = 'yes';
							}
						}
						callbackFunc();
					}else{
						next();
					}
				}
			)
			.then(function(next) {
				console.log("currentQuestion");
				console.log(currentQuestion);
				console.log(extractsFromQuestion.QTAG1);
				console.log("anson kung");
				if(extractsFromQuestion.QTAG1 == null){
					console.log("Enters in QTAG1 check...");
					var entities = classifierResponse["entities"];

					for(var i=0;i<entities.length;i++){
						var entity = entities[i]['type'];
						console.log("entity:::"+entity);
						console.log((entity == "builtin.geography.city"));
						if (entity == "builtin.geography.city") {
							console.log('testing');
							console.log(entities[i]['type']);
							extractsFromQuestion.QTAG1 = entities[i]['type'];
						}
					}
					callbackFunc();
				}else{
					next();
				}
			})
			.then(function(next) {
					console.log('comes here in QTAG2 check...');
					if(currentQuestion == 'BORN_LOCATION_2'){
						console.log('got current question correct');
						var entities = classifierResponse["entities"];
						for(var i=0;i<entities.length;i++){
							var entity = entities[i]['type'];
							console.log("entity:::"+entity);
							if (entity == "builtin.datetime.date") {
								console.log('date');
								console.log(entities[i]['entity']);
								// log(QUESTIONS["LOST_DATE"]);
								// log([ 'Thank you. So just to confirm, was the card lost as of yesterday' ]);
								lostDate = entities[i]['entity'];
								QUESTIONS["LOST_DATE"] = [ 'Thank you. So just to confirm, was the card lost as of ' + lostDate + '?'];
								console.log(QUESTIONS);
								// QUESTIONS["LOST_DATE"] = QUESTIONS["LOST_DATE"] + entities[i]['entity'];
								extractsFromQuestion.QTAG2 = entities[i]['type'];
							}
							// if(entity == "medicalBenefit" && entities[i]['entity'] == "specialist"){
							// 		extractsFromQuestion.QTAG2 = entities[i]['entity'];
							// 		break;
							// }else if(entity == "medicalBenefit" && (entities[i]['entity'] == "physiotherapist") || 
							// 										(entities[i]['entity'] == "physio") ||
							// 										(entities[i]['entity'] == "physical therapy")){
							// 		extractsFromQuestion.QTAG2 = "physiotherapist";
							// 		break;
							// }
						}
						console.log("returns from qtag2 check");
						callbackFunc();
					}else{
						next();
					}
				}
			)
			.then(function(next) {
					console.log('2222');
						console.log('testing??????');
					if(currentQuestion == 'LOST_DATE'){
						console.log('testing??????');
						console.log('got current question correct');
						var entities = classifierResponse["entities"];
						for(var i=0;i<entities.length;i++){
							var entity = entities[i]['type'];
							console.log("entity:::"+entity);
							console.log(entity);
							if (entity == "positiveResponse") {
						console.log('testing??????');
								console.log('yes now');
								extractsFromQuestion.QTAG3 = entity;
								QUESTIONS["CARD_REVIEW_2"] = [ 'I do see, however, that there are some transactions dated since ' + lostDate + '. Would you like to review them?'];
							}
						}
						callbackFunc();
					}else{
						next();
					}
				}
			)
			.then(function(next) {
				console.log('33333');
					if(currentQuestion == 'CARD_REVIEW_2'){
						console.log('got current question correct');
						var entities = classifierResponse["entities"];
						for(var i=0;i<entities.length;i++){
							var entity = entities[i]['type'];
							console.log("entity:::"+entity);
							if (entity == "positiveResponse" || entity == "negativeResponse") {
								extractsFromQuestion.QTAG4 = entity;
								// QUESTIONS["CARD_REVIEW_2"] = [ 'I do see, however, that there are some transactions dated since ' + lostDate + '. Would you like to review them?'];
							}
						}
						callbackFunc();
					}else{
						next();
					}
				}
			)
			.then(function(next) {
				console.log('44444');
					if(currentQuestion == 'TRANSACTION'){
						console.log('got current question correct');
						var entities = classifierResponse["entities"];
						for(var i=0;i<entities.length;i++){
							var entity = entities[i]['type'];
							console.log("entity:::"+entity);
							if (entity == "positiveResponse") {
								extractsFromQuestion.QTAG5 = entity;
								// QUESTIONS["CARD_REVIEW_2"] = [ 'I do see, however, that there are some transactions dated since ' + lostDate + '. Would you like to review them?'];
							}
						}
						callbackFunc();
					}else{
						next();
					}
			})
			.then(function(next) {
				console.log('5555');
					if(currentQuestion == 'TRANSACTION_AUTH_2'){
						console.log('got current question correct');
						var entities = classifierResponse["entities"];
						for(var i=0;i<entities.length;i++){
							var entity = entities[i]['type'];
							console.log("entity:::"+entity);
							if (entity == "negativeResponse") {
								extractsFromQuestion.QTAG6 = entity;
								// QUESTIONS["CARD_REVIEW_2"] = [ 'I do see, however, that there are some transactions dated since ' + lostDate + '. Would you like to review them?'];
							}
						}
						callbackFunc();
					}else{
						next();
					}
				}
			)
		;
	}

	var processEntityFromLuis = function(question, type, value, score, callback) {
		log('processEntityFromLuis:' + type + ':' + value);

		if (type == "medicalBenefit") {
			console.log('found medical benefit ...');
			if (extractsFromQuestion.QTAG2 == null) {

				log('Found type == medicalBenefit');
				if(value == "Outpatient"){
					extractsFromQuestion.QTAG2 = value;
				}else{
					callback('ERROR - Cannot undesratnd this service at this moment');
				}
				
			}
		}else {
			callback();
		}
	}

	

	

	var clearProfile = function(){
        
        log("************CLEAR PROFILE***************");
		extractsFromQuestion.QTAG1 = null;
	    extractsFromQuestion.QTAG2 = null;
		extractsFromQuestion.QTAG3 = null;
		extractsFromQuestion.QTAG4 = null;
		extractsFromQuestion.QTAG5 = null;
		extractsFromQuestion.QTAG6 = null;
		extractsFromQuestion.INTENT = null;
		extractsFromQuestion.SPECIALIST_SEARCH=null;
		extractsFromQuestion.TYPE_OF_SPECIALIST=null;
		extractsFromQuestion.PHYSIOTHERAPIST_COVERAGE=null;
		extractsFromQuestion.MEMBERTIER = null;
		
		currentQuestion = "";
	}

	var handleSpecialCharacter = function(value,callback){
		value = value.replace(/\?/g,'');
		value = value.replace(/\+/g,'');
		value = value.replace(/\[/g,'');
		callback(value);
	}

	var getClassifier = function(question,returnSuccessResponse,failureResponse){
		console.log('in getClassifier');
		luisModule.nlc(question,function(predictClass){
		    log(predictClass);
		    returnSuccessResponse(predictClass);
		},function(err){
			log('in NLC returing error');
			log(err);
			failureResponse(err);
		});
	}

   	var init = function(){
		// initialize global variables and methods
		extractionEngine = new cExtractionEngine();
	}

    // for extractionEngineSpec.js
	that.getExtractionEngine = function(){
    	return extractionEngine;
    }

    that.setDevelopmentMode = function(isDev) {
    	isDevelopmentMode = isDev;
    }

    init();
   
    return that;
} 
module.exports = function() {
	return new cCalculatorModule();
}
