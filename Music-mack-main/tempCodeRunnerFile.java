import java.util.*;
class RemoveVowels
{
   public static void main(String args[])
   {     
	String str="Hello World";
 	StringBuffer sc=new StringBuffer(str);
        // for iteration
	for(int i=0;i<sc.length();i++)
	{
	  // creating charater value 
	    char ch=sc.charAt(i);
	    if(ch=='a'||ch=='A'||ch=='e'||ch=='E'||ch=='I'||ch=='i'||ch=='o'||ch=='O'||ch=='u'||ch=='U')
	    {
			sc.deleteCharAt(i);
			//Adjust index after deletion
	    }
	}
	System.out.println("Original String" +str);
	System.out.println("After removing vowels "+sc);
   }
}
	   
	   