import pyttsx3
import datetime
import speech_recognition as sr
import wikipedia
import re
import webbrowser
import os
import time
import chatgpt
import pywhatkit
import requests
from flask import Flask, request, jsonify
import json
import dotenv
dotenv.load_dotenv()
 

# Initialize the speech engine
engine = pyttsx3.init('sapi5')
voices = engine.getProperty('voices')
engine.setProperty('voice', voices[0].id)



# Speak function
def speak(audio):
    engine.say(audio)
    engine.runAndWait()

# Greet the user
def wishMe():
    hour = int(datetime.datetime.now().hour)
    if hour >= 0 and hour < 12:
        speak("Good Morning!")
    elif hour >= 12 and hour < 18:
        speak("Good Afternoon!")
    else:
        speak("Good Evening!")
    speak("I am Jarvis, your personal assistant. How can I help you today?")

# Take microphone input from the user and return as string
def takeCommand():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print("Listening...")
        r.pause_threshold = 1
        audio = r.listen(source)
    try:
        print("Recognizing...")
        query = r.recognize_google(audio, language='en-in')
        print(f"User said: {query}\n")
    except Exception as e:
        print("Say that again please...")
        return "None"
    return query

# Main program
if __name__ == "__main__":
    wishMe()
    while True:
        query = takeCommand().lower()
        if query == "none":
            continue

        if 'wikipedia' in query:
            speak("Searching Wikipedia...")

            query = query.replace("wikipedia", "")
            query = re.sub(r"(jarvis|tell me about|can you|look up|search for|who is|what is|from)", "", query)
            query = query.strip()

            try:
                results = wikipedia.summary(query, sentences=5)
                speak("According to Wikipedia")
                print(results)
                speak(results)
            except wikipedia.exceptions.DisambiguationError as e:
                speak(f"The term '{query}' is ambiguous. Please be more specific.")
                print(f"Disambiguation options: {e.options}")
            except wikipedia.exceptions.PageError:
                speak(f"Sorry, I couldn't find any results for '{query}'.")
                print(f"No page found for: {query}")
            except Exception as e:
                speak("Something went wrong while searching Wikipedia.")
                print(f"Error: {e}")

        elif 'open youtube' in query:
            speak("Opening YouTube")
            webbrowser.open("youtube.com")
        elif 'open google' in query:
            speak("Opening Google")
            webbrowser.open("google.com")
        elif 'open stack overflow' in query:
            speak("Opening Stack Overflow")
            webbrowser.open("stackoverflow.com")
        elif 'open github' in query:
            speak("Opening GitHub")
            webbrowser.open("github.com")
        elif 'open instagram' in query:
            speak("Opening Instagram")
            webbrowser.open("instagram.com")
        elif 'open facebook' in query:
            speak("Opening Facebook")
            webbrowser.open("facebook.com")
        elif 'open twitter' in query:
            speak("Opening Twitter")
            webbrowser.open("twitter.com")
        elif 'open linkedin' in query:
            speak("Opening LinkedIn")
            webbrowser.open("linkedin.com")
        elif 'open whatsapp' in query:
            speak("Opening WhatsApp")
            webbrowser.open("https://web.whatsapp.com")
        elif 'open amazon' in query:
            speak("Opening Amazon")
            webbrowser.open("amazon.com")
        elif 'open flipkart' in query:
            speak("Opening Flipkart")
            webbrowser.open("flipkart.com")
        elif 'open gmail' in query:
            speak("Opening Gmail")
            webbrowser.open("gmail.com")

        elif 'the time' in query:
            strTime = datetime.datetime.now().strftime("%H:%M:%S")
            speak(f"The time is {strTime}")
            print(f"The time is {strTime}")
        elif 'the date' in query:
            strDate = datetime.datetime.now().strftime("%Y-%m-%d")
            speak(f"Today's date is {strDate}")
            print(f"Today's date is {strDate}")

        elif 'vs code' in query:
            speak("Opening Visual Studio Code")
            codePath = "C:\\Users\\PIYUSH\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe"
            os.startfile(codePath)

        elif 'open discord' in query:
            speak("Opening Discord")
            discordPath = "C:\\Users\\PIYUSH\\AppData\\Local\\Discord\\Update.exe --processStart Discord.exe"
            os.startfile(discordPath)

        elif 'set alarm' in query:
            speak("What time should I set the alarm for? For example, say 6 30 AM or 18 45.")
            alarm_input = takeCommand().lower()

            try:
                match = re.search(r'(\d{1,2})\s*(\d{1,2})\s*(am|pm)?', alarm_input)
                if match:
                    hour = int(match.group(1))
                    minute = int(match.group(2))
                    period = match.group(3)

                    if period == 'pm' and hour != 12:
                        hour += 12
                    elif period == 'am' and hour == 12:
                        hour = 0

                    alarm_time = f"{hour:02d}:{minute:02d}"
                    speak(f"Alarm set for {alarm_time}")

                    while True:
                        current_time = datetime.datetime.now().strftime("%H:%M")
                        if current_time == alarm_time:
                            speak("Wake up! It's time!")
                            break
                        time.sleep(30)
                else:
                    speak("Sorry, I didn't understand the time format.")
            except Exception as e:
                speak("There was an error setting the alarm.")
                print(f"Alarm error: {e}")

        elif 'shutdown pc' in query or 'shutdown computer' in query or 'shutdown the system' in query:
            speak("Are you sure you want to shut down the computer? Please say yes or no.")
            confirmation = takeCommand().lower()
            if 'yes' in confirmation:
                speak("Shutting down the system. Goodbye!")
                os.system("shutdown /s /t 5")
                break
            else:
                speak("Shutdown canceled.")

        elif 'exit' in query or 'stop' in query or 'bye' in query:
            speak("Goodbye! Have a great day.")
            break

        
        
        elif 'hello' in query:
            speak("Hello! How can I assist you today?")
            print("Hello! How can I assist you today?")
        elif 'how are you' in query:
            speak("I am just a program, but thanks for asking! How can I help you?")
            print("I am just a program, but thanks for asking! How can I help you?")
        elif 'thank you' in query:
            speak("You're welcome! If you need anything else, just let me know.")
            print("You're welcome! If you need anything else, just let me know.")
        elif 'what can you do' in query:
            speak("I can assist you with various tasks such as searching Wikipedia, opening websites, setting alarms, and more.")
            print("I can assist you with various tasks such as searching Wikipedia, opening websites, setting alarms, and more.")
        elif 'tell me a joke' in query:
            speak("Why don't scientists trust atoms? Because they make up everything!")
            print("Why don't scientists trust atoms? Because they make up everything!")
        elif 'music' in query:
            speak("what will you like to listen to?")
            search_query=takeCommand().lower()
            search_query=search_query.replace("jarvis play music","")
             
            speak(f"playing {search_query}")
            pywhatkit.playonyt(search_query)
            
 
   

        elif 'search' in query:
            speak("What would you like to search for?")
            search_query = takeCommand().lower()
            webbrowser.open(f"https://www.google.com/search?q={search_query}")
        elif 'weather' in query:
            speak("Please tell me the city name.")
            city = takeCommand().lower()
            webbrowser.open(f"https://www.weather.com/weather/today/l/{city}")
        elif 'news' in query:
            speak("Opening the latest news.")
            webbrowser.open("https://news.google.com")
        elif 'calculator' in query:
            speak("Opening the calculator.")
            os.startfile("calc.exe")
        elif 'notepad' in query:
            speak("Opening Notepad.")
            os.startfile("notepad.exe")
        elif 'valo' in query:
            speak("Opening Valo")
            os.startfile("valorant.exe")

        elif 'reminder' in query:
            speak("What would you like to be reminded about?")
            reminder = takeCommand().lower()
            speak(f"Reminder set for: {reminder}")
            # Here you can implement a reminder system using a scheduling library like schedule or APScheduler
        elif 'translate' in query:
            speak("Please tell me the text you want to translate.")
            text_to_translate = takeCommand().lower()
            speak(f"Translating: {text_to_translate}")
            # Here you can implement translation using Google Translate API or any other translation service
         
        elif 'tell me about' in query:
            speak("What would you like to ask about?")
            chat_query = takeCommand().lower()
            response = chatgpt.get_response(chat_query)
            speak(response)
            print(response)
        elif 'hotstar' in query:
            speak("Opening Hotstar")
            webbrowser.open("hotstar.com")
        elif 'netflix' in query:
            speak("Opening Netflix")
            webbrowser.open("netflix.com")
        elif 'spotify' in query:
            speak("Opening Spotify")
            webbrowser.open("spotify.com")
        elif 'get up baby' in query:
            speak("I am up and ready to assist you!")
            print("I am up and ready to assist you!")
        elif 'goodbye' in query:
            speak("Goodbye! Have a great day ahead.")
            print("Goodbye! Have a great day ahead.")
            break
        elif 'go to sleep' in query:
            speak("your system is going to sleep mode.")
            os.system("rundll32.exe powrprof.dll,SetSuspendState 0,1,0")
        elif 'restart the system' in query:
            speak("Are you sure you want to restart the computer? Please say yes or no.")
            confirmation = takeCommand().lower()
            if 'yes' in confirmation:
                speak("Restarting the system. Goodbye!")
                os.system("shutdown /r /t 5")
                break
            else:
                speak("Restart canceled.")
        elif 'open camera' in query:
            speak("Opening camera")
            os.system("start microsoft.windows.camera:")
        elif 'lock screen' in query:
            speak("Locking the screen")
            os.system("rundll32.exe user32.dll,LockWorkStation")
        elif 'wake up' in query:
            speak("Unlocking the screen")
            os.system("rundll32.exe user32.dll,LockWorkStation")
         
         


        

        
         


        
            

        else:
            speak("Sorry, I didn't understand that. Can you please repeat?")
        






 
     