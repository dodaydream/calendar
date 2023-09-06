all:
	python3 FanshaweWebAdvisor.py > input.txt
	node schedule2ics.js
