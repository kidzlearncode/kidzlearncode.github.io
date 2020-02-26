def ReadFile( filename ):
    with open( filename ) as file:
        lines = [ line.rstrip('\n') for line in file ]
    return lines

deletedFiles = ReadFile( 'deleted_files.txt' )
modifiedFiles = ReadFile( 'modified_files.txt' )
createdFiles = ReadFile( 'newly_created_files.txt' )
content = """---
deployment:
    tasks:
      - export DEPLOYPATH=/home/sy144jcghkcv/
"""


for i in deletedFiles:
    content += ( '      - rm $DEPLOYPATH/' +  i + '\n' )
for i in modifiedFiles:
    content += ( '      - cp ' + i + ' $DEPLOYPATH/' +  i.split( '/', 1 )[ 0 ] + '\n' )
for i in createdFiles:
    content += ( '      - cp ' + i + ' $DEPLOYPATH/' +  i.split( '/', 1 )[ 0 ] + '\n' )

print( content )