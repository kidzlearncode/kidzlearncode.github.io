i = 2
j = 0
while j < 4 do
    while i < 5 do
        shellbyForward()
        i = i + 1
    end
    if j < 3 then
        shellbyRight()
    end
    i = 0
    j = j + 1
end
