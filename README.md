# Projekt IoT Google Home

Aby uruchomić należy utworzyć nowy projekt typu Conversational używając konsoli Google Actions. Następnie przejść do konfiguracji projektu w Dialogflow i w ustawieniach
eksport/import należy wybrać opcję Restore from zip i załadować plik agent.zip dostępny w repozytorium.

Nastepnie trzeba wygenerować klucze dostępu do service account, trzeba przejść do konsoli Google Cloud dla projektu i z menu wybrać zakładkę APIs & Services, nastepnie 
Credentials, Create Credentials, Service Account. Należy nastepnie dla konta wygenerować klucz w postaci pliku json, pobrać plik i zmienić nazwę na service-account.json
i umieścić w repozytorium z projektem.

Nastepnie w konsoli Google Cloud w zakładce APIs & Services należy w Library odnaleźć Actions API i włączyć je dla projektu.

Żeby uruchomić należy w konsoli dialogflow w zakładce fulfillment uzupełnić url webhooka tym wygenerowanym na przykład w programie ngrok. Aplikacja nasłuchuje
requesty na porcie 8080.
