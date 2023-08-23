from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.alert import Alert
import sys
from warnings import warn

"""
" use case:
    pip install selenium
    python3 -W ignore FanshaweWebAdvisor.py
  
  enter your username and password at login web page
  select a semester at semester web page
"""


class FanshaweCalendar(list):
    def __init__(self, titles, items):
        classInfos = [dict(zip(titles, item)) for item in items]
        newClassInfos = []
        for classInfo in classInfos:
            if '\n' in classInfo['Class Start & End Dates']:
                newClassInfos.append(type(self).splitClassInfo(classInfo))
        classInfos += newClassInfos
        # this is interesting, in python we can use super() at last
        # but in java or other language, we must use super() at first
        # so, if we want to do simular things in java, we must use
        # the factory pattern, but it is not neessary in python
        # init the list
        super().__init__(classInfos)

    def __str__(self):
        return '\n'.join([self.concatTab(classInfo) for classInfo in self])

    @staticmethod
    def concatTab(classInfo):
        # fliter out the key value equal to 'Credits'
        return '\t'.join([classInfo[k] for k in classInfo if k != 'Credits'])

    @staticmethod
    def splitClassInfo(classInfo):
        newClassInfo = classInfo.copy()
        for key in classInfo:
            if '\n' in classInfo[key]:
                classInfo[key] = classInfo[key].split('\n')[0]
        for key in newClassInfo:
            if '\n' in newClassInfo[key]:
                newClassInfo[key] = newClassInfo[key].split('\n')[-1]
        return newClassInfo


class FanshaweWebAdvisor:
    def __init__(self, url):
        try:
            self.driver = webdriver.safari()
            self.driver.get(url)
            return
        except:
            warn(" Safari driver not found")

        try:
            self.driver = webdriver.Chrome()
            self.driver.get(url)
            return
        except:
            warn(" Chrome driver not found")

        try:
            self.driver = webdriver.Firefox()
            self.driver.get(url)
            return
        except:
            warn(" Firefox driver not found")

        try:
            self.driver = webdriver.Edge()
            self.driver.get(url)
            return
        except:
            warn(" Edge driver not found")

        raise Exception("No driver found")

    def deley(function):
        def wrapper(*args, **kwargs):
            import time
            ret = function(*args, **kwargs)
            time.sleep(1)
            return ret
        return wrapper

    @deley
    def clickHref(self, text):
        hreflist = self.driver.find_elements(By.TAG_NAME, "a")
        for href in hreflist:
            if href.text == text:
                href.click()
                return True
        warn(f"{text} not found")
        return False

    def alert(self, string):
        #build a alert
        #print a alert in a new window
        warn(string)
        return

    @deley
    def waitUserActive(self):
        url = self.driver.current_url
        WebDriverWait(self.driver, 60*5).until(EC.url_changes(url))

    @staticmethod
    def tr2List(tr):
        tds = tr.find_elements(By.TAG_NAME, "td")
        return [td.text for td in tds if td.text != ""]

    def parseCalendar(self):
        #get trs
        tbody = self.driver.find_elements(By.TAG_NAME, "tbody")[-1]
        trs = tbody.find_elements(By.TAG_NAME, "tr")
        #get titles
        ths = trs[0].find_elements(By.TAG_NAME, "th")
        titles = [th.text for th in ths if th.text != ""]
        # get items
        items = [self.tr2List(tr) for tr in trs[1:]]
        return titles, items

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.driver.close()


if __name__ == "__main__":
    URL = 'https://webadvisor.fanshawec.ca/'

    with FanshaweWebAdvisor(URL) as web:
        # first try to log out other user
        web.clickHref("Log Out")
        web.clickHref("Log In")
        web.alert("please use you password to login")
        web.waitUserActive()
        web.clickHref("Students")
        web.clickHref("Class Schedule List")
        web.alert("please select a semester")
        web.waitUserActive()
        titles, items = web.parseCalendar()

    calendar = FanshaweCalendar(titles, items)

    print(calendar)


