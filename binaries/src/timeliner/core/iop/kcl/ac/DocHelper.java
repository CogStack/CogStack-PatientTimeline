package timeliner.core.iop.kcl.ac;

import java.io.File;
import java.io.IOException;

import org.apache.commons.io.FileUtils;

public class DocHelper {
	public static BinaryEHRDoc getABinaryDoc(String id, String srcTable, 
			String colName, String filePath){
		
		try {
			BinaryEHRDoc doc = new BinaryEHRDoc();
			doc.setId(id);
			doc.setSrcTable(srcTable);
			doc.setSrcColumn(colName);
			doc.setData(FileUtils.readFileToByteArray(new File(filePath)));
			return doc;
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}
	
	public static void main(String[] args){
		String filePath = "/Users/jackey.wu/Desktop/263.full.pdf";
		BinaryEHRDoc doc = DocHelper.getABinaryDoc("123", "table1", "dataCol", filePath);
		System.out.println(String.format("doc %s, length %d bytes", doc.getId(), doc.getData().length));
		//1. you can get the binary like the following
		byte[] data = doc.getData();
		//2. convert the byte array into pdf
	}
}
