package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"
)

func main() {
	log.Println("Serving content...")
	http.HandleFunc("/department/", serve_department)
	http.HandleFunc("/info/", serve_form_defaults)
	log.Fatal(http.ListenAndServe(":8081", nil))
}

func read_department(term string, department string) (string, error) {
	client := &http.Client{
		Timeout: time.Second * 10,
	}
	req, err := http.NewRequest(
		"POST",
		"https://classes.iastate.edu/app/rest/courses/preferences",
		strings.NewReader(`{"selectedTerm":`+term+`,"selectedDepartment":"`+department+`"}`),
	)
	if err != nil {
		return "", fmt.Errorf("Got error %s", err.Error())
	}
	req.Header.Set("user-agent", "proxy server because you don't allow CORS")
	req.Header.Add("Content-Type", "application/json; charset=UTF-8")

	response, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("Got error reading classes api %s", err.Error())
	}
	defer response.Body.Close()
	buf := new(strings.Builder)
	_, err = io.Copy(buf, response.Body)
	return buf.String(), nil
}

func read_form_defaults() (string, error) {
	client := &http.Client{
		Timeout: time.Second * 10,
	}
	req, err := http.NewRequest("GET", "https://classes.iastate.edu/app/rest/formdefaults", nil)
	if err != nil {
		return "", fmt.Errorf("Got error reading form defaults %s", err.Error())
	}
	req.Header.Set("user-agent", "proxy server because you don't allow CORS")

	response, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("Got error %s", err.Error())
	}
	defer response.Body.Close()
	buf := new(strings.Builder)
	_, err = io.Copy(buf, response.Body)
	return buf.String(), nil
}

func serve_department(response http.ResponseWriter, request *http.Request) {
	url := request.URL.Path
	sections := strings.Split(url, "/")
	term := sections[2]
	department := strings.ToUpper(sections[3])
	log.Printf("Reading department %q term %q", department, term)
	json_response, err := read_department(term, department)
	response.Header().Add("Access-Control-Allow-Origin", "*")
	if err != nil {
		fmt.Fprintf(response, "Error in reading API for department %q term %q", department, term)
	} else {
		fmt.Fprintf(response, "%s", json_response)
	}
}

func serve_form_defaults(response http.ResponseWriter, request *http.Request) {
	log.Printf("Reading form defaults")
	json_response, err := read_form_defaults()
	response.Header().Add("Access-Control-Allow-Origin", "*")
	if err != nil {
		fmt.Fprintf(response, "Error in reading API for form defaults")
	} else {
		fmt.Fprintf(response, "%s", json_response)
	}
}
