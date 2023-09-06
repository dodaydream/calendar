# Fanshawe college's calender for MAP1 class A student.
# 
# Usage:
#  - git clone this repo.
#  - `cd calender`
#  - `make all`
#  - Enter you user name and password in browser's window and submit it.
#  - Wait until website ask you select which semester you need.
#  - select semester, submit.
#  - check the ics file in this folder.
all:
	python3 FanshaweWebAdvisor.py > input.txt
	node schedule2ics.js
