import requests
from bs4 import BeautifulSoup
import csv

headers = {
    "Host": "google.com",
    "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:58.0) Gecko/20100101 Firefox/58.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1"
}

# List of 4 urls that contains Indiana Appeals Data from present to 2005
urls = [
    "https://www.in.gov/judiciary/opinions/archapp.html",
    "https://www.in.gov/judiciary/opinions/archapp2010.html",
    "https://www.in.gov/judiciary/opinions/archapp2008.html",
    "https://www.in.gov/judiciary/opinions/archapp2005.html",
]

cases = {}
cases['links'] = []

# URLs for a future, more complete scraper
new_url = "https://www.in.gov/judiciary/opinions/appeals.html"
old_url = "https://www.in.gov/judiciary/opinions/previous/archapp.html"
case_search_url = "https://public.courts.in.gov/mycase/#/vw/Search"

# Initialize all_cases csv list with a header
all_cases = [['URL',
            'Date Published',
            'Case',
            'Lower Court Case Number',
            'Appellate Court Case Number']]

for url in urls:
    r = requests.get(url, headers=headers)
    soup = BeautifulSoup(r.text, 'html.parser')

    tr = soup.find_all('tr')
    list_of_cases = tr[7].find_all('td')[0].find_all('td')

    string = ""

    # Each case is broken into 4 parts. We must iterate in groups of 4 
    case_iterator = 0

    while case_iterator < len(list_of_cases):
        case = list_of_cases[case_iterator+1]

        row = ["https://www.in.gov" + case.find('a').get('href'),   # URL
               list_of_cases[case_iterator].text,                   # Date Published
               case.text,                                           # Case
               list_of_cases[case_iterator + 2].text,               # Lower Court Case Number
               list_of_cases[case_iterator + 3].text,               # Appellate Court Case Number
               ]
        all_cases.append(row)

        # # To see what case we're working on
        # print("https://www.in.gov" + list_of_cases[x+1].find('a').get('href'))
        case_iterator += 4

latest_date = all_cases[1][1]

with open('indiana_appeals.csv', 'w', newline='') as file:
    writer = csv.writer(file)
    writer.writerows(all_cases)
