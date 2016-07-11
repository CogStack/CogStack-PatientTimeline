package timeliner.core.iop.kcl.ac;

/***
 * binary document class for pdf, image and etc.
 * @author honghan.wu
 *
 */
public class BinaryEHRDoc {

	private String id, srcTable, srcColumn;
	private byte[] data;
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getSrcTable() {
		return srcTable;
	}
	public void setSrcTable(String srcTable) {
		this.srcTable = srcTable;
	}
	public String getSrcColumn() {
		return srcColumn;
	}
	public void setSrcColumn(String srcColumn) {
		this.srcColumn = srcColumn;
	}
	public byte[] getData() {
		return data;
	}
	public void setData(byte[] data) {
		this.data = data;
	}
	
	
}
